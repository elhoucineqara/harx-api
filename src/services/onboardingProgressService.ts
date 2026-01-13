import OnboardingProgress, { IOnboardingProgress } from '../models/OnboardingProgress';
import Company from '../models/Company';
import dbConnect from '../lib/dbConnect';
import { Types } from 'mongoose';

class OnboardingProgressService {
  async getAll() {
    await dbConnect();
    return await OnboardingProgress.find({});
  }

  async getById(id: string) {
    await dbConnect();
    return await OnboardingProgress.findById(id);
  }

  async create(data: any) {
    await dbConnect();
    return await OnboardingProgress.create(data);
  }

  async update(id: string, data: any) {
    await dbConnect();
    return await OnboardingProgress.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    await dbConnect();
    return await OnboardingProgress.findByIdAndDelete(id);
  }
  async initializeProgress(companyId: string) {
    await dbConnect();
    
    // Check if progress already exists
    const existingProgress = await OnboardingProgress.findOne({ companyId });
    if (existingProgress) {
      throw new Error('Onboarding progress already exists for this company');
    }

    const initialProgress = new OnboardingProgress({
      companyId,
      currentPhase: 1,
      completedSteps: [1],
      phases: [
        { 
          id: 1, 
          status: 'in_progress', 
          steps: [
            { id: 1, status: 'completed', completedAt: new Date() },
            { id: 2, status: 'pending', disabled: true },
            { id: 3, status: 'pending' }
          ]
        },
        { id: 2, status: 'pending', steps: Array.from({length: 6}, (_, i) => ({ id: i + 4, status: 'pending' })) },
        { id: 3, status: 'pending', steps: Array.from({length: 3}, (_, i) => ({ id: i + 10, status: 'pending' })) },
        { id: 4, status: 'pending', steps: [{ id: 13, status: 'pending' }] }
      ]
    });

    return await initialProgress.save();
  }

  async getProgress(companyId: string) {
    await dbConnect();
    const progress = await OnboardingProgress.findOne({ companyId });
    if (!progress) {
      throw new Error('Onboarding progress not found');
    }
    return progress;
  }

  async updateStepProgress(companyId: string, phaseId: number, stepId: number, status: string) {
    await dbConnect();
    const progress = await OnboardingProgress.findOne({ companyId });
    if (!progress) {
      throw new Error('Onboarding progress not found');
    }

    const phase = progress.phases.find((p: any) => p.id === phaseId);
    if (!phase) {
      throw new Error('Phase not found');
    }

    const step = phase.steps.find((s: any) => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    if (phaseId > 1) {
      const previousPhases = progress.phases.filter((p: any) => p.id < phaseId);
      const incompletePreviousPhases = previousPhases.filter((p: any) => p.status !== 'completed');
      
      if (incompletePreviousPhases.length > 0) {
        throw new Error('Cannot modify steps in phase ' + phaseId + ' because previous phases are not completed');
      }
    }

    step.status = status as any;
    
    if (status === 'completed') {
      step.completedAt = new Date();
      if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps.push(stepId);
      }

      const nextStep = phase.steps.find((s: any) => 
        s.id > stepId && 
        !s.disabled && 
        s.status !== 'completed'
      );

      if (nextStep) {
        nextStep.status = 'in_progress';
      } else {
        const nextPhase = progress.phases.find((p: any) => p.id > phase.id);
        if (nextPhase) {
          const firstAvailableStep = nextPhase.steps.find((s: any) => !s.disabled && s.status !== 'completed');
          if (firstAvailableStep) {
            firstAvailableStep.status = 'in_progress';
            nextPhase.status = 'in_progress';
          }
        }
      }
    } else {
      const stepIndex = progress.completedSteps.indexOf(stepId);
      if (stepIndex > -1) {
        progress.completedSteps.splice(stepIndex, 1);
      }
      step.completedAt = undefined;
    }

    const activeSteps = phase.steps.filter((s: any) => !s.disabled);
    
    if (phase.id === 2) {
      const stepsWithoutStep9 = activeSteps.filter((s: any) => s.id !== 9);
      const allStepsExceptStep9Completed = stepsWithoutStep9.every((s: any) => s.status === 'completed');
      if (allStepsExceptStep9Completed) {
        phase.status = 'completed';
      } else if (activeSteps.some((s: any) => s.status === 'completed' || s.status === 'in_progress')) {
        phase.status = 'in_progress';
      }
    } else if (phase.id === 3) {
      const step10 = phase.steps.find((s: any) => s.id === 10);
      if (step10 && step10.status === 'completed') {
        phase.status = 'completed';
      } else if (activeSteps.some((s: any) => s.status === 'completed' || s.status === 'in_progress')) {
        phase.status = 'in_progress';
      }
    } else {
      const allStepsCompleted = activeSteps.every((s: any) => s.status === 'completed');
      if (allStepsCompleted) {
        phase.status = 'completed';
      } else if (activeSteps.some((s: any) => s.status === 'completed' || s.status === 'in_progress')) {
        phase.status = 'in_progress';
      }
    }

    const currentActivePhase = progress.phases.find((p: any) => 
      p.status === 'in_progress' || 
      (p.status === 'pending' && p.steps.some((s: any) => s.status === 'in_progress'))
    );
    
    if (currentActivePhase) {
      progress.currentPhase = currentActivePhase.id;
    }

    await progress.save();
    return progress;
  }

  async updateCurrentPhase(companyId: string, phase: number) {
    await dbConnect();
    const progress = await OnboardingProgress.findOne({ companyId });
    if (!progress) {
      throw new Error('Onboarding progress not found');
    }

    if (phase > 1) {
      const previousPhases = progress.phases.filter((p: any) => p.id < phase);
      const incompletePreviousPhases = previousPhases.filter((p: any) => p.status !== 'completed');
      
      if (incompletePreviousPhases.length > 0) {
        throw new Error('Cannot access phase ' + phase + ' because previous phases are not completed');
      }
    }

    progress.currentPhase = phase;
    await progress.save();
    return progress;
  }

  async resetProgress(companyId: string) {
    await dbConnect();
    await OnboardingProgress.findOneAndDelete({ companyId });
    
    const initialProgress = new OnboardingProgress({
      companyId,
      currentPhase: 1,
      completedSteps: [],
      phases: [
        { id: 1, status: 'in_progress', steps: Array.from({length: 3}, (_, i) => ({ id: i + 1, status: 'pending' })) },
        { id: 2, status: 'pending', steps: Array.from({length: 6}, (_, i) => ({ id: i + 4, status: 'pending' })) },
        { id: 3, status: 'pending', steps: Array.from({length: 3}, (_, i) => ({ id: i + 10, status: 'pending' })) },
        { id: 4, status: 'pending', steps: [{ id: 13, status: 'pending' }] }
      ]
    });

    return await initialProgress.save();
  }

  async getProgressByUserId(userId: string) {
    await dbConnect();
    const company = await Company.findOne({ userId });
    
    if (!company) {
      throw new Error('No company found for this user');
    }

    const progress = await OnboardingProgress.findOne({ companyId: company._id });

    if (!progress) {
      throw new Error('No onboarding progress found');
    }

    return progress;
  }

  async fixCurrentPhase(companyId: string) {
    await dbConnect();
    const progress = await OnboardingProgress.findOne({ companyId });
    if (!progress) {
      throw new Error('Onboarding progress not found');
    }

    const currentActivePhase = progress.phases.find((p: any) => 
      p.status === 'in_progress' || 
      (p.status === 'pending' && p.steps.some((s: any) => s.status === 'in_progress'))
    );
    
    if (currentActivePhase) {
      progress.currentPhase = currentActivePhase.id;
      await progress.save();
      return progress;
    } else {
      return progress;
    }
  }

  async completeLastPhaseAndStep(companyId: string) {
    await dbConnect();
    const progress = await OnboardingProgress.findOne({ companyId });
    if (!progress) {
      throw new Error('Onboarding progress not found');
    }

    const lastPhase = progress.phases[progress.phases.length - 1];
    if (!lastPhase) {
      throw new Error('No phases found');
    }

    const lastStep = lastPhase.steps[lastPhase.steps.length - 1];
    if (!lastStep) {
      throw new Error('No steps found in last phase');
    }

    lastStep.status = 'completed';
    lastStep.completedAt = new Date();

    if (!progress.completedSteps.includes(lastStep.id)) {
      progress.completedSteps.push(lastStep.id);
    }

    lastPhase.status = 'completed';
    progress.currentPhase = lastPhase.id;

    await progress.save();
    return progress;
  }
}

export default new OnboardingProgressService();



