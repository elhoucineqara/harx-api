import { Request, Response } from 'express';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OnboardingProgress from '@/models/OnboardingProgress';
import mongoose from 'mongoose';

// PUT /api/companies/[id]/onboarding/phases/[phaseId]/steps/[stepId] - Update step progress
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; phaseId: string; stepId: string }> }
) {
  try {
    await dbConnect();
    const { id: companyId, phaseId, stepId } = await params;
    const { status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.json(
        { message: 'Invalid company ID format' },
        { status: 400 }
      );
    }

    const progress = await OnboardingProgress.findOne({ companyId });
    if (!progress) {
      return res.json(
        { message: 'Onboarding progress not found' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de l'étape
    const phase = progress.phases.find((p: any) => p.id === parseInt(phaseId));
    if (!phase) {
      return res.json({ message: 'Phase not found' }, { status: 404 });
    }

    const step = phase.steps.find((s: any) => s.id === parseInt(stepId));
    if (!step) {
      return res.json({ message: 'Step not found' }, { status: 404 });
    }

    // Validation: vérifier que toutes les phases précédentes sont complétées avant de modifier une étape
    if (parseInt(phaseId) > 1) {
      const previousPhases = progress.phases.filter((p: any) => p.id < parseInt(phaseId));
      const incompletePreviousPhases = previousPhases.filter((p: any) => p.status !== 'completed');
      
      if (incompletePreviousPhases.length > 0) {
        return res.json({ 
          message: 'Cannot modify steps in phase ' + phaseId + ' because previous phases are not completed',
          incompletePhases: incompletePreviousPhases.map((p: any) => p.id)
        }, { status: 400 });
      }
    }

    step.status = status;
    
    // Gérer l'ajout/retrait du step de la liste completedSteps
    if (status === 'completed') {
      step.completedAt = new Date();
      if (!progress.completedSteps.includes(parseInt(stepId))) {
        progress.completedSteps.push(parseInt(stepId));
      }

      // Trouver le prochain step disponible dans la phase courante
      const nextStep = phase.steps.find((s: any) => 
        s.id > parseInt(stepId) && 
        !s.disabled && 
        s.status !== 'completed'
      );

      if (nextStep) {
        // Si un prochain step est trouvé dans la phase courante, le marquer comme 'in_progress'
        nextStep.status = 'in_progress';
      } else {
        // Si pas de prochain step dans la phase courante, chercher dans la phase suivante
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
      // Si le status n'est pas 'completed', retirer le step de completedSteps
      const stepIndex = progress.completedSteps.indexOf(parseInt(stepId));
      if (stepIndex > -1) {
        progress.completedSteps.splice(stepIndex, 1);
      }
      step.completedAt = undefined;
    }

    // Mettre à jour le statut de la phase
    const activeSteps = phase.steps.filter((s: any) => !s.disabled);
    
    // Logique spéciale pour la Phase 2
    if (phase.id === 2) {
      const stepsWithoutStep9 = activeSteps.filter((s: any) => s.id !== 9);
      const allStepsExceptStep9Completed = stepsWithoutStep9.every((s: any) => s.status === 'completed');
      if (allStepsExceptStep9Completed) {
        phase.status = 'completed';
      } else if (activeSteps.some((s: any) => s.status === 'completed' || s.status === 'in_progress')) {
        phase.status = 'in_progress';
      }
    }
    // Logique spéciale pour la Phase 3
    else if (phase.id === 3) {
      const step10 = phase.steps.find((s: any) => s.id === 10);
      if (step10 && step10.status === 'completed') {
        phase.status = 'completed';
      } else if (activeSteps.some((s: any) => s.status === 'completed' || s.status === 'in_progress')) {
        phase.status = 'in_progress';
      }
    } else {
      // Logique normale
      const allStepsCompleted = activeSteps.every((s: any) => s.status === 'completed');
      if (allStepsCompleted) {
        phase.status = 'completed';
      } else if (activeSteps.some((s: any) => s.status === 'completed' || s.status === 'in_progress')) {
        phase.status = 'in_progress';
      }
    }

    // Calculer automatiquement la phase courante basée sur l'état réel
    const currentActivePhase = progress.phases.find((p: any) => 
      p.status === 'in_progress' || 
      (p.status === 'pending' && p.steps.some((s: any) => s.status === 'in_progress'))
    );
    
    if (currentActivePhase) {
      progress.currentPhase = currentActivePhase.id;
    }

    await progress.save();
    return res.json(progress);
  } catch (error: any) {
    console.error('Error updating step progress:', error);
    return res.json(
      { message: 'Error updating step progress', error: error.message },
      { status: 500 }
    );
  }
}

