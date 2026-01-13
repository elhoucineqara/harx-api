import Company from '../models/Company';
import dbConnect from '../lib/dbConnect';
import mongoose from 'mongoose';

export interface ICompany {
  userId?: string;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  overview: string;
  companyIntro?: string;
  mission?: string;
  subscription: 'free' | 'standard' | 'premium';
  culture?: {
    values: string[];
    benefits: string[];
    workEnvironment: string;
  };
  opportunities?: {
    roles: string[];
    growthPotential: string;
    training: string;
  };
  technology?: {
    stack: string[];
    innovation: string;
  };
  contact?: {
    email: string;
    phone: string;
    address: string;
    website: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

class CompanyService {
  async createCompany(companyData: ICompany) {
    await dbConnect();
    
    // Sanitize and prepare data for MongoDB
    const dataToSave: any = {
      name: companyData.name,
      overview: companyData.overview,
    };
    
    // Add optional fields only if they exist
    if (companyData.userId) {
      dataToSave.userId = new mongoose.Types.ObjectId(companyData.userId);
    }
    if (companyData.logo) dataToSave.logo = companyData.logo;
    if (companyData.industry) dataToSave.industry = companyData.industry;
    if (companyData.founded) dataToSave.founded = companyData.founded;
    if (companyData.headquarters) dataToSave.headquarters = companyData.headquarters;
    if (companyData.companyIntro) dataToSave.companyIntro = companyData.companyIntro;
    if (companyData.mission) dataToSave.mission = companyData.mission;
    if (companyData.subscription) dataToSave.subscription = companyData.subscription;
    
    // Handle nested objects - only include if they have valid data
    if (companyData.culture) {
      dataToSave.culture = {
        ...(companyData.culture.values && { values: companyData.culture.values }),
        ...(companyData.culture.benefits && { benefits: companyData.culture.benefits }),
        ...(companyData.culture.workEnvironment && { workEnvironment: companyData.culture.workEnvironment })
      };
    }
    
    if (companyData.opportunities) {
      dataToSave.opportunities = {
        ...(companyData.opportunities.roles && { roles: companyData.opportunities.roles }),
        ...(companyData.opportunities.growthPotential && { growthPotential: companyData.opportunities.growthPotential }),
        ...(companyData.opportunities.training && { training: companyData.opportunities.training })
      };
    }
    
    if (companyData.technology) {
      dataToSave.technology = {
        ...(companyData.technology.stack && { stack: companyData.technology.stack }),
        ...(companyData.technology.innovation && { innovation: companyData.technology.innovation })
      };
    }
    
    if (companyData.contact) {
      dataToSave.contact = {};
      if (companyData.contact.email) dataToSave.contact.email = companyData.contact.email;
      if (companyData.contact.phone) dataToSave.contact.phone = companyData.contact.phone;
      if (companyData.contact.address) dataToSave.contact.address = companyData.contact.address;
      if (companyData.contact.website) dataToSave.contact.website = companyData.contact.website;
      if (companyData.contact.coordinates) dataToSave.contact.coordinates = companyData.contact.coordinates;
    }
    
    if (companyData.socialMedia) {
      dataToSave.socialMedia = {};
      if (companyData.socialMedia.linkedin) dataToSave.socialMedia.linkedin = companyData.socialMedia.linkedin;
      if (companyData.socialMedia.twitter) dataToSave.socialMedia.twitter = companyData.socialMedia.twitter;
      if (companyData.socialMedia.facebook) dataToSave.socialMedia.facebook = companyData.socialMedia.facebook;
      if (companyData.socialMedia.instagram) dataToSave.socialMedia.instagram = companyData.socialMedia.instagram;
    }
    
    console.log('[CompanyService] Data to save:', {
      hasName: !!dataToSave.name,
      hasOverview: !!dataToSave.overview,
      hasUserId: !!dataToSave.userId,
      keys: Object.keys(dataToSave)
    });
    
    try {
      return await Company.create(dataToSave);
    } catch (error: any) {
      console.error('[CompanyService] Error creating company:', {
        error: error.message,
        name: error.name,
        errors: error.errors,
        stack: error.stack?.substring(0, 500)
      });
      throw error;
    }
  }

  async getAllCompanies() {
    await dbConnect();
    return Company.find();
  }

  async getCompanyById(id: string) {
    await dbConnect();
    return Company.findById(id);
  }

  async getCompanyByUserId(userId: string) {
    await dbConnect();
    return Company.findOne({ userId });
  }

  async updateCompany(id: string, updateData: Partial<ICompany>) {
    await dbConnect();
    return Company.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteCompany(id: string) {
    await dbConnect();
    return Company.findByIdAndDelete(id);
  }

  async updateSubscription(id: string, subscription: string) {
    await dbConnect();
    return Company.findByIdAndUpdate(id, { subscription }, { new: true });
  }

  async getCompanyDetails(id: string) {
    await dbConnect();
    const company = await Company.findById(id);
    if (!company) return null;

    // In the future, this might include more aggregated data (e.g., active gigs, employees)
    return company;
  }

  async getAll() {
    return this.getAllCompanies();
  }

  async getById(id: string) {
    return this.getCompanyById(id);
  }

  async create(data: ICompany) {
    return this.createCompany(data);
  }

  async update(id: string, data: Partial<ICompany>) {
    return this.updateCompany(id, data);
  }

  async delete(id: string) {
    return this.deleteCompany(id);
  }
}

export default new CompanyService();
