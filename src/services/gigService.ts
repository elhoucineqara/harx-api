import Gig from '../models/Gig';
import dbConnect from '../lib/dbConnect';
import mongoose from 'mongoose';

// Import related models to ensure they are registered
import '../models/Activity';
import '../models/Country';
import '../models/Currency';
import '../models/Industry';
import '../models/Language';
import '../models/Sector';
import '../models/Skill';
import '../models/Timezone';
import '../models/User';
import '../models/Company';

class GigService {
  async createGig(gigData: any) {
    await dbConnect();
    try {
      console.log('💾 Creating gig with data:', JSON.stringify(gigData, null, 2));
      
      // Clean and validate ObjectIds
      const cleanedData: any = { ...gigData };
      
      // Validate userId
      if (cleanedData.userId) {
        if (!mongoose.Types.ObjectId.isValid(cleanedData.userId)) {
          console.warn('⚠️ Invalid userId, setting to null:', cleanedData.userId);
          cleanedData.userId = null;
        }
      }
      
      // Validate companyId
      if (cleanedData.companyId) {
        if (!mongoose.Types.ObjectId.isValid(cleanedData.companyId)) {
          console.warn('⚠️ Invalid companyId, setting to null:', cleanedData.companyId);
          cleanedData.companyId = null;
        }
      }
      
      // Validate destination_zone
      if (cleanedData.destination_zone) {
        if (!mongoose.Types.ObjectId.isValid(cleanedData.destination_zone)) {
          console.warn('⚠️ Invalid destination_zone, removing:', cleanedData.destination_zone);
          delete cleanedData.destination_zone;
        }
      }
      
      // Validate activities array
      if (cleanedData.activities && Array.isArray(cleanedData.activities)) {
        cleanedData.activities = cleanedData.activities.filter((id: any) => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return true;
          }
          console.warn('⚠️ Invalid activity ID, removing:', id);
          return false;
        });
      }
      
      // Validate industries array
      if (cleanedData.industries && Array.isArray(cleanedData.industries)) {
        cleanedData.industries = cleanedData.industries.filter((id: any) => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return true;
          }
          console.warn('⚠️ Invalid industry ID, removing:', id);
          return false;
        });
      }
      
      // Validate skills ObjectIds
      if (cleanedData.skills) {
        ['professional', 'technical', 'soft'].forEach(category => {
          if (cleanedData.skills[category] && Array.isArray(cleanedData.skills[category])) {
            cleanedData.skills[category] = cleanedData.skills[category].map((skill: any) => {
              if (skill.skill && !mongoose.Types.ObjectId.isValid(skill.skill)) {
                console.warn(`⚠️ Invalid ${category} skill ID, removing:`, skill.skill);
                return null;
              }
              return skill;
            }).filter((skill: any) => skill !== null);
          }
        });
        
        // Validate languages
        if (cleanedData.skills.languages && Array.isArray(cleanedData.skills.languages)) {
          cleanedData.skills.languages = cleanedData.skills.languages.map((lang: any) => {
            if (lang.language && !mongoose.Types.ObjectId.isValid(lang.language)) {
              console.warn('⚠️ Invalid language ID, removing:', lang.language);
              return null;
            }
            return lang;
          }).filter((lang: any) => lang !== null);
        }
      }
      
      // Validate availability.time_zone
      if (cleanedData.availability?.time_zone) {
        if (!mongoose.Types.ObjectId.isValid(cleanedData.availability.time_zone)) {
          console.warn('⚠️ Invalid time_zone, removing:', cleanedData.availability.time_zone);
          delete cleanedData.availability.time_zone;
        }
      }
      
      // Validate commission.currency
      if (cleanedData.commission?.currency) {
        if (!mongoose.Types.ObjectId.isValid(cleanedData.commission.currency)) {
          console.warn('⚠️ Invalid currency ID, removing:', cleanedData.commission.currency);
          delete cleanedData.commission.currency;
        }
      }
      
      console.log('💾 Cleaned gig data:', JSON.stringify(cleanedData, null, 2));
      const newGig = new Gig(cleanedData);
      await newGig.save();
      console.log('✅ Gig created successfully:', newGig._id);
      return newGig;
    } catch (error: any) {
      console.error("❌ Error in createGig:", error);
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message).join(", ");
        console.error("❌ Validation errors:", validationErrors);
        throw new Error("Validation failed: " + validationErrors);
      }
      if (error.name === "CastError") {
        console.error("❌ Cast error - Invalid ObjectId or data type:", error.path, error.value);
        throw new Error(`Invalid data type for ${error.path}: ${error.value}`);
      }
      console.error("❌ Error stack:", error.stack);
      throw new Error(error.message || "Failed to create Gig");
    }
  }

  // Alias method for controller compatibility
  async create(gigData: any) {
    return this.createGig(gigData);
  }

  async getAllGigs() {
    await dbConnect();
    try {
      return await Gig.find()
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
    } catch (error) {
      console.error("Error in getAllGigs:", error);
      throw new Error("Failed to retrieve gigs");
    }
  }

  // Alias method for controller compatibility
  async getAll() {
    return this.getAllGigs();
  }

  async getGigById(id: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const gig = await Gig.findById(id)
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId')
        .populate('userId');
      
      if (!gig) {
        throw new Error("Gig not found");
      }
      return gig;
    } catch (error) {
      console.error("Error in getGigById:", error);
      throw error;
    }
  }

  // Alias method for controller compatibility
  async getById(id: string) {
    return this.getGigById(id);
  }

  async updateGig(id: string, updateData: any) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const updatedGig = await Gig.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true
        }
      )
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId')
        .populate('userId');

      if (!updatedGig) {
        throw new Error("Gig not found");
      }

      return updatedGig;
    } catch (error) {
      console.error("Error in updateGig:", error);
      throw error;
    }
  }

  // Alias method for controller compatibility
  async update(id: string, updateData: any) {
    return this.updateGig(id, updateData);
  }

  async deleteGig(id: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      // Récupérer le gig avec toutes les données populées avant de le supprimer
      const gigToDelete = await Gig.findById(id)
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId')
        .populate('userId');

      if (!gigToDelete) {
        throw new Error("Gig not found");
      }

      // Supprimer le gig
      await Gig.findByIdAndDelete(id);

      // Retourner le gig avec toutes les données populées
      return gigToDelete;
    } catch (error) {
      console.error("Error in deleteGig:", error);
      throw error;
    }
  }

  // Alias method for controller compatibility
  async delete(id: string) {
    return this.deleteGig(id);
  }

  async getGigsByUserId(userId: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID format");
      }

      const gigs = await Gig.find({ userId })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
      return gigs;
    } catch (error) {
      console.error("Error in getGigsByUserId:", error);
      throw new Error("Failed to retrieve gigs");
    }
  }

  async getGigsByCompanyId(companyId: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new Error("Invalid Company ID format");
      }

      const gigs = await Gig.find({ companyId })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
      return gigs;
    } catch (error) {
      console.error("Error in getGigsByCompanyId:", error);
      throw new Error("Failed to retrieve gigs");
    }
  }

  async getActiveGigs() {
    await dbConnect();
    try {
      return await Gig.find({ status: 'active' })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId');
    } catch (error) {
      console.error("Error in getActiveGigs:", error);
      throw new Error("Failed to retrieve active gigs");
    }
  }

  async getGigDetailsById(id: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const gig = await Gig.findById(id)
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId');
      
      if (!gig) {
        throw new Error("Gig not found");
      }
      return gig;
    } catch (error) {
      console.error("Error in getGigDetailsById:", error);
      throw new Error("Failed to retrieve gig details");
    }
  }

  async getLastGigByCompanyId(companyId: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new Error("Invalid Company ID format");
      }

      const lastGig = await Gig.findOne({ companyId })
        .sort({ createdAt: -1 })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
      
      return lastGig;
    } catch (error) {
      console.error("Error in getLastGigByCompanyId:", error);
      throw new Error("Failed to retrieve last gig");
    }
  }
}

export default new GigService();



