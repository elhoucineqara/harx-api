// @ts-nocheck
import Match from "../models/Match";

/**
 * Calcule le score de matching global entre un agent et un gig
 * @param {Object} agent - Le représentant avec ses caractéristiques
 * @param {Object} gig - Le gig avec ses exigences
 * @param {Object} weights - Les poids personnalisés pour chaque critère
 * @returns {Object} Le score final et les détails de chaque critère
 */
export const calculateMatchScore = (agent, gig, weights = {}) => {
  const defaultWeights = {
    industry: 0.20, // 20% weight for industry matching
    experience: 0.20, // 20% for experience matching
    skills: 0.20, // 20% for skills
    language: 0.15, // 15% for language
    region: 0.15, // 15% for region matching
    availability: 0.10, // 10% for availability
  };

  // Utiliser les poids fournis ou les poids par défaut
  const finalWeights = { ...defaultWeights, ...weights };

  // Calculer les scores individuels
  const industryScore = calculateIndustryScore(agent, gig);
  const experienceScore = calculateExperienceScore(agent, gig);
  const skillsScore = calculateSkillsScore(agent, gig);
  const languageScore = calculateLanguageScore(agent, gig);
  const regionScore = calculateRegionScore(agent, gig);
  const availabilityScore = calculateAvailabilityScore(agent, gig);

  // Calculer le score total en utilisant les poids
  const totalScore =
    industryScore * finalWeights.industry +
    experienceScore * finalWeights.experience +
    skillsScore * finalWeights.skills +
    languageScore * finalWeights.language +
    regionScore * finalWeights.region +
    availabilityScore * finalWeights.availability;

  return {
    score: totalScore,
    details: {
      industryScore,
      experienceScore,
      skillsScore,
      languageScore,
      regionScore,
      availabilityScore,
    },
  };
};

/**
 * Calcule le score d'expérience en comparant l'expérience du agent avec les exigences du gig
 * @param {Object} agent - Le représentant avec ses expériences
 * @param {Object} gig - Le gig avec ses exigences
 * @returns {number} Score entre 0 et 1
 */
function calculateExperienceScore(agent, gig) {
  if (
    !gig.seniority?.yearsExperience ||
    !agent.professionalSummary?.yearsOfExperience
  ) {
    console.log("Missing experience data:", {
      agent: agent._id,
      gig: gig._id,
      gigExperience: gig.seniority?.yearsExperience,
      agentExperience: agent.professionalSummary?.yearsOfExperience,
    });
    return 0.5;
  }

  // Extraire les années d'expérience
  const agentExperience = parseInt(agent.professionalSummary.yearsOfExperience) || 0;
  const gigExperience = parseInt(gig.seniority.yearsExperience) || 0;

  console.log("Experience comparison:", {
    agentId: agent._id,
    gigId: gig._id,
    agentExperience,
    gigExperience,
    isExactMatch: agentExperience === gigExperience,
    isSufficient: agentExperience >= gigExperience,
  });

  // Logique de scoring basée sur la correspondance des années d'expérience
  if (agentExperience >= gigExperience) {
    // L'agent a suffisamment d'expérience
    if (agentExperience === gigExperience) {
      return 1.0; // Match parfait
    } else if (agentExperience <= gigExperience * 1.5) {
      return 0.9; // Légèrement plus d'expérience (bon)
    } else if (agentExperience <= gigExperience * 2) {
      return 0.8; // Plus d'expérience mais acceptable
    } else {
      return 0.7; // Beaucoup plus d'expérience (peut être overqualified)
    }
  } else {
    // L'agent n'a pas assez d'expérience
    if (agentExperience >= gigExperience * 0.8) {
      return 0.6; // Presque suffisant
    } else if (agentExperience >= gigExperience * 0.6) {
      return 0.4; // Partiellement suffisant
    } else if (agentExperience >= gigExperience * 0.4) {
      return 0.2; // Insuffisant mais pas complètement
    } else {
      return 0.0; // Complètement insuffisant
    }
  }
}

/**
 * Calcule le score de compétences en comparant les compétences du agent avec celles requises
 * @param {Object} agent - Le représentant avec ses compétences
 * @param {Object} gig - Le gig avec ses compétences requises
 * @returns {number} Score entre 0 et 1
 */
function calculateSkillsScore(agent, gig) {
  if (!gig.skills || !agent.skills) {
    console.log("Missing skills data:", { agent: agent._id, gig: gig._id });
    return 0.5;
  }

  // Extraire tous les skills du gig (professional, technical, soft)
  const gigSkills = [
    ...(gig.skills.professional || []),
    ...(gig.skills.technical || []),
    ...(gig.skills.soft || [])
  ];

  // Extraire tous les skills de l'agent (professional, technical, soft)
  const agentSkills = [
    ...(agent.skills.professional || []),
    ...(agent.skills.technical || []),
    ...(agent.skills.soft || [])
  ];

  if (gigSkills.length === 0) {
    console.log("No skills required for gig:", gig._id);
    return 1.0; // Si aucun skill requis, score parfait
  }

  if (agentSkills.length === 0) {
    console.log("No skills found for agent:", agent._id);
    return 0.0; // Si l'agent n'a pas de skills, score nul
  }

  // Compter les skills qui matchent par ID
  let matchingSkills = 0;
  const skillMatches = [];

  gigSkills.forEach(gigSkill => {
    // Normaliser l'ID du skill du gig
    const gigSkillId = gigSkill.skill?.toString();
    
    if (!gigSkillId) {
      console.log("Invalid gig skill ID:", gigSkill);
      return;
    }

    // Chercher le skill correspondant chez l'agent par ID
    const agentSkill = agentSkills.find(agentSkill => {
      const agentSkillId = agentSkill.skill?.toString();
      return agentSkillId === gigSkillId;
    });

    if (agentSkill) {
      console.log("Skill match found by ID:", {
        agentId: agent._id,
        gigId: gig._id,
        skillId: gigSkillId,
        gigLevel: gigSkill.level,
        agentLevel: agentSkill.level
      });

      // Vérifier le niveau de compétence
      const agentLevel = parseInt(agentSkill.level) || 0;
      const gigLevel = parseInt(gigSkill.level) || 0;

      if (agentLevel >= gigLevel) {
        matchingSkills++;
        skillMatches.push({
          skillId: gigSkillId,
          gigLevel: gigLevel,
          agentLevel: agentLevel,
          matchType: 'perfect'
        });
      } else {
        skillMatches.push({
          skillId: gigSkillId,
          gigLevel: gigLevel,
          agentLevel: agentLevel,
          matchType: 'insufficient_level'
        });
      }
    } else {
      console.log("Skill not found for agent:", {
        agentId: agent._id,
        gigId: gig._id,
        requiredSkillId: gigSkillId
      });
      skillMatches.push({
        skillId: gigSkillId,
        gigLevel: gigSkill.level,
        agentLevel: null,
        matchType: 'missing'
      });
    }
  });

  const score = matchingSkills / gigSkills.length;

  console.log("Skills matching result:", {
    agentId: agent._id,
    gigId: gig._id,
    totalRequiredSkills: gigSkills.length,
    matchingSkills: matchingSkills,
    score: score,
    skillMatches: skillMatches
  });

  return score;
}

/**
 * Calcule le score de langue en comparant les langues du agent avec celles requises
 * @param {Object} agent - Le représentant avec ses langues
 * @param {Object} gig - Le gig avec ses langues requises
 * @returns {number} Score entre 0 et 1
 */
function calculateLanguageScore(agent, gig) {
  if (!agent.personalInfo?.languages || !gig.skills?.languages) {
    console.log("Missing language data:", {
      agentId: agent._id,
      hasAgentLanguages: !!agent.personalInfo?.languages,
      hasGigLanguages: !!gig.skills?.languages,
    });
    return 0.5;
  }

  console.log("Language matching details:", {
    agentId: agent._id,
    agentLanguages: agent.personalInfo.languages,
    gigLanguages: gig.skills.languages,
  });

  // Vérifier si l'agent a au moins une des langues requises avec le bon niveau
  const languageMatches = gig.skills.languages.map(gigLang => {
    const gigLangId = gigLang.language?.toString();
    const gigLevel = gigLang.proficiency?.toLowerCase();

    console.log("Checking gig language:", {
      gigId: gig._id,
      gigLanguageId: gigLangId,
      gigLevel: gigLevel,
    });

    // Chercher la langue correspondante chez l'agent par ID
    const agentLang = agent.personalInfo.languages.find(agentLang => {
      const agentLangId = agentLang.language?.toString();
      return agentLangId === gigLangId;
    });

    if (!agentLang) {
      console.log("Language not found for agent:", {
        agentId: agent._id,
        gigId: gig._id,
        requiredLanguageId: gigLangId
      });
      return {
        languageId: gigLangId,
        gigLevel: gigLevel,
        agentLevel: null,
        matchType: 'missing'
      };
    }

    const agentLevel = agentLang.proficiency?.toLowerCase();

    // Fonction helper pour comparer les niveaux de langue de manière hiérarchique
    // Niveaux CEFR : A1 < A2 < B1 < B2 < C1 < C2 < Native
    const getLevelValue = (level: string): number => {
      const normalizedLevel = level.toLowerCase().trim();
      if (normalizedLevel.includes('native') || normalizedLevel.includes('bilingual')) return 7;
      if (normalizedLevel === 'c2') return 6;
      if (normalizedLevel === 'c1') return 5;
      if (normalizedLevel === 'b2') return 4;
      if (normalizedLevel === 'b1') return 3;
      if (normalizedLevel === 'a2') return 2;
      if (normalizedLevel === 'a1') return 1;
      // Niveaux alternatifs
      if (normalizedLevel.includes('professional working') || normalizedLevel === 'professional') return 5;
      if (normalizedLevel === 'conversational' || normalizedLevel === 'fluent') return 4;
      if (normalizedLevel === 'intermediate' || normalizedLevel === 'intermédiaire') return 3;
      if (normalizedLevel === 'beginner' || normalizedLevel === 'débutant') return 1;
      return 0;
    };

    // Vérifier le niveau de compétence
    // Un agent avec un niveau supérieur ou égal au niveau requis est acceptable
    const gigLevelValue = getLevelValue(gigLevel);
    const agentLevelValue = getLevelValue(agentLevel);
    
    // Match si le niveau de l'agent est supérieur ou égal au niveau requis
    const isLevelMatch = agentLevelValue >= gigLevelValue && agentLevelValue > 0;
    
    // Fallback pour les anciennes valeurs textuelles
    const isLevelMatchFallback =
      (gigLevel === "conversational" &&
        [
          "professional working",
          "native or bilingual",
          "c1",
          "c2",
          "b2",
        ].includes(agentLevel)) ||
      (gigLevel === "professional" &&
        ["professional working", "native or bilingual", "c1", "c2"].includes(
          agentLevel
        )) ||
      (gigLevel === "native" &&
        ["native or bilingual", "c2"].includes(agentLevel));
    
    const finalIsLevelMatch = isLevelMatch || isLevelMatchFallback;

    console.log("Language comparison details:", {
      agentId: agent._id,
      gigId: gig._id,
      gigLanguageId: gigLangId,
      agentLanguageId: agentLang.language?.toString(),
      gigLevel: gigLevel,
      agentLevel: agentLevel,
      gigLevelValue: gigLevelValue,
      agentLevelValue: agentLevelValue,
      isLevelMatch: finalIsLevelMatch,
    });

    if (finalIsLevelMatch) {
      return {
        languageId: gigLangId,
        gigLevel: gigLevel,
        agentLevel: agentLevel,
        matchType: 'perfect'
      };
    } else {
      return {
        languageId: gigLangId,
        gigLevel: gigLevel,
        agentLevel: agentLevel,
        matchType: 'insufficient_level'
      };
    }
  });

  // Calculer le score basé sur les matches parfaits
  const perfectMatches = languageMatches.filter(match => match.matchType === 'perfect');
  const score = perfectMatches.length / gig.skills.languages.length;

  console.log("Language matching result:", {
    agentId: agent._id,
    gigId: gig._id,
    totalRequiredLanguages: gig.skills.languages.length,
    perfectMatches: perfectMatches.length,
    score: score,
    languageMatches: languageMatches
  });

  return score;
}

/**
 * Calcule le score de disponibilité en comparant les créneaux du agent avec ceux du gig
 * @param {Object} agent - Le représentant avec ses disponibilités
 * @param {Object} gig - Le gig avec son planning
 * @returns {number} Score entre 0 et 1
 */
function calculateAvailabilityScore(agent, gig) {
  if (
    !agent.availability ||
    !gig.availability ||
    !Array.isArray(agent.availability)
  ) {
    console.log("Missing availability data:", {
      agent: agent._id,
      gig: gig._id,
    });
    return 0.2;
  }

  const normalizeString = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "")
      .replace(/\s+/g, "");
  };

  const gigAvailability = gig.availability.schedule || [];
  const gigDays = gigAvailability.map((day) => normalizeString(day.day));
  const gigHours = gigAvailability.map((day) => ({
    start: timeToMinutes(day.hours.start),
    end: timeToMinutes(day.hours.end),
  }));

  const availableDays = agent.availability.filter((day) => {
    const normalizedDay = normalizeString(day);
    return gigDays.some((gigDay) => {
      const isExactMatch = normalizedDay === gigDay;
      const isPartialMatch =
        normalizedDay.includes(gigDay) || gigDay.includes(normalizedDay);

      console.log("Comparing availability:", {
        agentId: agent._id,
        gigId: gig._id,
        agentDay: day,
        gigDay,
        isExactMatch,
        isPartialMatch,
      });

      return isExactMatch || isPartialMatch;
    });
  });

  return 0.2 + 0.8 * (availableDays.length / gigDays.length);
}

/**
 * Calcule le score de correspondance régionale entre un agent et un gig
 * @param {Object} agent - Le représentant avec ses informations de localisation
 * @param {Object} gig - Le gig avec sa destination_zone
 * @returns {number} Score entre 0 et 1
 */
function calculateRegionScore(agent, gig) {
  if (!gig.destination_zone) {
    console.log("Missing destination zone for gig:", gig._id);
    return 0.5; // Score neutre si pas de destination définie
  }

  console.log("Region matching:", {
    agentId: agent._id,
    gigId: gig._id,
    gigDestinationZone: gig.destination_zone,
    agentTimezone: agent.availability?.timeZone
  });

  // Comparaison principale : alpha2 code du pays de destination vs countryCode de la timezone de l'agent
  if (agent.availability?.timeZone && gig.destination_zone) {
    // Si les données sont populées, on peut comparer les codes pays
    if (gig.destination_zone.cca2 && agent.availability.timeZone.countryCode) {
      const gigCountryCode = gig.destination_zone.cca2; // alpha-2 code du pays de destination
      const agentCountryCode = agent.availability.timeZone.countryCode; // alpha-2 code du pays de la timezone
      
      if (gigCountryCode === agentCountryCode) {
        console.log("Perfect country code match:", { 
          gigCountryCode, 
          agentCountryCode,
          gigCountry: gig.destination_zone.name?.common,
          agentTimezone: agent.availability.timeZone.zoneName 
        });
        return 1.0; // Match parfait : même pays
      } else {
        console.log("Country code mismatch:", { 
          gigCountryCode, 
          agentCountryCode,
          gigCountry: gig.destination_zone.name?.common,
          agentTimezone: agent.availability.timeZone.zoneName 
        });
        return 0.2; // Score faible : pays différents
      }
    }
  }

  // Score de fallback basé sur la présence de données
  if (agent.availability?.timeZone) {
    console.log("Agent has timezone but no populated data for comparison");
    return 0.6; // Score moyen si l'agent a une timezone
  } else {
    console.log("Agent has no timezone information");
    return 0.1; // Score très faible si pas de timezone
  }
}

function calculateIndustryScore(agent, gig) {
  // Nouveau schéma: gig.industries est un array d'ObjectIds
  if (
    (!gig.category && (!gig.industries || gig.industries.length === 0)) ||
    !agent.professionalSummary ||
    !agent.professionalSummary.industries
  ) {
    console.log("Missing industry data:", {
      gigCategory: gig.category,
      gigIndustries: gig.industries,
      agentIndustries: agent.professionalSummary?.industries,
    });
    return 0.0;
  }

  // Normaliser les catégories et industries pour la comparaison
  const normalizeString = (str: any) => {
    if (!str) return "";
    // Handle objects (e.g., populated Industry objects or ObjectIds)
    if (typeof str !== 'string') {
      if (str && typeof str === 'object') {
        if (str.name) return normalizeString(str.name);
        if (str.toString) return normalizeString(str.toString());
        return "";
      }
      return String(str);
    }
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "")
      .replace(/\s+/g, "");
  };

  let hasMatchingIndustry = false;

  // Si le gig a une catégorie (backward compatibility)
  if (gig.category) {
    const gigCategory = normalizeString(gig.category);
    hasMatchingIndustry = agent.professionalSummary.industries.some(
      (industry: any) => {
        const normalizedIndustry = normalizeString(industry);
        const isExactMatch = normalizedIndustry === gigCategory;
        const isPartialMatch =
          normalizedIndustry.includes(gigCategory) ||
          gigCategory.includes(normalizedIndustry);
        return isExactMatch || isPartialMatch;
      }
    );
  }

  // Si le gig a des industries (nouveau schéma)
  if (gig.industries && gig.industries.length > 0 && !hasMatchingIndustry) {
    // Pour l'instant, on compare les ObjectIds directement
    // Dans une implémentation complète, on populaterait les industries
    hasMatchingIndustry = agent.professionalSummary.industries.some(
      (agentIndustryId) => {
        return gig.industries.some(gigIndustryId => 
          gigIndustryId.toString() === agentIndustryId.toString()
        );
      }
    );
  }

  console.log("Industry comparison:", {
    gigId: gig._id,
    gigCategory: gig.category,
    gigIndustries: gig.industries,
    agentIndustries: agent.professionalSummary.industries,
    hasMatchingIndustry,
  });

  return hasMatchingIndustry ? 1.0 : 0.0;
}

/**
 * Trouve les meilleurs matches pour un gig spécifique
 * @param {Object} gig - Le gig à matcher
 * @param {Array} agents - Liste des agents disponibles
 * @param {Object} weights - Poids personnalisés
 * @param {Object} options - Options de recherche
 * @returns {Object} Résultats de la recherche
 */
export const findMatchesForGig = async (
  gig,
  agents,
  weights = {},
  options = {}
) => {
  const { limit = 10, minimumScore = 0.4, showAllScores = false } = options;

  console.log("Finding matches for gig:", {
    gigId: gig._id,
    industry: gig.industry,
    totalAgents: agents.length,
    weights,
  });

  // Trier les critères par poids décroissant
  const sortedCriteria = Object.entries(weights)
    .sort(([, a], [, b]) => b - a)
    .map(([criterion]) => criterion);

  console.log("Sorted criteria by weight:", sortedCriteria);

  // Filtrer les agents selon les critères triés
  let filteredAgents = agents;
  const filterResults = {};

  for (const criterion of sortedCriteria) {
    const weight = weights[criterion];
    const beforeCount = filteredAgents.length;

    // Si le poids est faible (< 0.5), on ne filtre pas sur ce critère
    // if (weight < 0.5) {
    console.log(`Skipping ${criterion} filter due to low weight (${weight})`);
    
    console.log(filterResults);

    filterResults[criterion] = {
      before: beforeCount,
      after: beforeCount,
      removed: 0,
      skipped: true,
    };
    continue;
    // }

    console.log(`Filtering by ${criterion} (weight: ${weight})...`);

    switch (criterion) {
      case "experience":
        filteredAgents = filteredAgents.filter((agent) => {
          if (!agent.professionalSummary?.yearsOfExperience || !gig.seniority?.yearsExperience) {
            return false;
          }

          const agentExperience = parseInt(agent.professionalSummary.yearsOfExperience) || 0;
          const gigExperience = parseInt(gig.seniority.yearsExperience) || 0;

          console.log("Experience filtering:", {
            agentId: agent._id,
            gigId: gig._id,
            agentExperience,
            gigExperience,
            isSufficient: agentExperience >= gigExperience,
          });

          // Accepter les agents qui ont au moins l'expérience requise
          return agentExperience >= gigExperience;
        });
        break;

      case "skills":
        filteredAgents = filteredAgents.filter((agent) => {
          if (!agent.skills?.professional || !gig.skills?.professional)
            return false;

          const normalizeString = (str) => {
            if (!str) return "";
            return str
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]/g, "")
              .replace(/\s+/g, "");
          };

          return gig.skills.professional.some((gigSkill) => {
            const normalizedGigSkill = normalizeString(gigSkill);

            return agent.skills.professional.some((agentSkill) => {
              const normalizedAgentSkill = normalizeString(agentSkill.skill);
              const isExactMatch = normalizedAgentSkill === normalizedGigSkill;
              const isPartialMatch =
                normalizedAgentSkill.includes(normalizedGigSkill) ||
                normalizedGigSkill.includes(normalizedAgentSkill);

              console.log("Skill comparison:", {
                agentId: agent._id,
                gigId: gig._id,
                gigSkill,
                agentSkill: agentSkill.skill,
                isExactMatch,
                isPartialMatch,
              });

              return isExactMatch || isPartialMatch;
            });
          });
        });
        break;

      case "language":
        filteredAgents = filteredAgents.filter((agent) => {
          if (!agent.personalInfo?.languages || !gig.skills?.languages)
            return false;

          const normalizeString = (str) => {
            if (!str) return "";
            return str
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]/g, "")
              .replace(/\s+/g, "");
          };

          return gig.skills.languages.some((gigLang) => {
            const normalizedGigLang = normalizeString(gigLang.name);
            const gigLevel = (gigLang.level || gigLang.proficiency || '').toLowerCase();

            return agent.personalInfo.languages.some((agentLang) => {
              const normalizedAgentLang = normalizeString(agentLang.language);
              const agentLevel = (agentLang.proficiency || '').toLowerCase();

              const isLanguageMatch = normalizedAgentLang === normalizedGigLang;
              
              // Fonction helper pour comparer les niveaux de langue de manière hiérarchique
              const getLevelValue = (level: string): number => {
                const normalizedLevel = level.toLowerCase().trim();
                if (normalizedLevel.includes('native') || normalizedLevel.includes('bilingual')) return 7;
                if (normalizedLevel === 'c2') return 6;
                if (normalizedLevel === 'c1') return 5;
                if (normalizedLevel === 'b2') return 4;
                if (normalizedLevel === 'b1') return 3;
                if (normalizedLevel === 'a2') return 2;
                if (normalizedLevel === 'a1') return 1;
                // Niveaux alternatifs
                if (normalizedLevel.includes('professional working') || normalizedLevel === 'professional') return 5;
                if (normalizedLevel === 'conversational' || normalizedLevel === 'fluent') return 4;
                if (normalizedLevel === 'intermediate' || normalizedLevel === 'intermédiaire') return 3;
                if (normalizedLevel === 'beginner' || normalizedLevel === 'débutant') return 1;
                return 0;
              };

              // Match si le niveau de l'agent est supérieur ou égal au niveau requis
              const gigLevelValue = getLevelValue(gigLevel);
              const agentLevelValue = getLevelValue(agentLevel);
              const isLevelMatch = agentLevelValue >= gigLevelValue && agentLevelValue > 0;
              
              // Fallback pour les anciennes valeurs textuelles
              const isLevelMatchFallback =
                (gigLevel === "professional" &&
                  ["professional working", "native or bilingual", "c1", "c2"].includes(agentLevel)) ||
                (gigLevel === "native" && ["native or bilingual", "c2"].includes(agentLevel));

              const finalIsLevelMatch = isLevelMatch || isLevelMatchFallback;

              console.log("Language comparison:", {
                agentId: agent._id,
                gigId: gig._id,
                gigLanguage: gigLang.name,
                agentLanguage: agentLang.language,
                gigLevel,
                agentLevel,
                gigLevelValue,
                agentLevelValue,
                isLanguageMatch,
                isLevelMatch: finalIsLevelMatch,
              });

              return isLanguageMatch && finalIsLevelMatch;
            });
          });
        });
        break;

      case "availability":
        filteredAgents = filteredAgents.filter((agent) => {
          if (!agent.availability || !gig.availability?.schedule) return false;

          const normalizeString = (str) => {
            if (!str) return "";
            return str
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]/g, "")
              .replace(/\s+/g, "");
          };

          try {
            const gigAvailability = gig.availability.schedule || [];
            const gigDays = gigAvailability.map((day) => normalizeString(day.day));

            return agent.availability.some((agentDay) => {
              const normalizedAgentDay = normalizeString(agentDay);
              return gigDays.some((gigDay) => {
                const isExactMatch = normalizedAgentDay === gigDay;
                const isPartialMatch =
                  normalizedAgentDay.includes(gigDay) ||
                  gigDay.includes(normalizedAgentDay);

                console.log("Availability comparison:", {
                  agentId: agent._id,
                  gigId: gig._id,
                  gigDay,
                  agentDay,
                  isExactMatch,
                  isPartialMatch,
                });

                return isExactMatch || isPartialMatch;
              });
            });
          } catch (error) {
            console.error("Error parsing gig availability:", error);
            return false;
          }
        });
        break;

      case "industry":
        filteredAgents = filteredAgents.filter((agent) => {
          if (!agent.professionalSummary?.industries) return false;
          
          // Nouveau schéma: vérifier gig.industries ou gig.category (backward compatibility)
          if (!gig.category && (!gig.industries || gig.industries.length === 0)) {
            return false;
          }

          const normalizeString = (str) => {
            if (!str) return "";
            return str
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]/g, "")
              .replace(/\s+/g, "");
          };

          let hasMatch = false;

          // Vérifier avec la catégorie (backward compatibility)
          if (gig.category) {
            const normalizedGigCategory = normalizeString(gig.category);
            hasMatch = agent.professionalSummary.industries.some((industry) => {
              const normalizedIndustry = normalizeString(industry);
              const isExactMatch = normalizedIndustry === normalizedGigCategory;
              const isPartialMatch =
                normalizedIndustry.includes(normalizedGigCategory) ||
                normalizedGigCategory.includes(normalizedIndustry);
              return isExactMatch || isPartialMatch;
            });
          }

          // Vérifier avec les industries (nouveau schéma)
          if (!hasMatch && gig.industries && gig.industries.length > 0) {
            hasMatch = agent.professionalSummary.industries.some((agentIndustryId) => {
              return gig.industries.some(gigIndustryId => 
                gigIndustryId.toString() === agentIndustryId.toString()
              );
            });
          }

          console.log("Industry filtering:", {
            agentId: agent._id,
            gigId: gig._id,
            gigCategory: gig.category,
            gigIndustries: gig.industries,
            agentIndustries: agent.professionalSummary.industries,
            hasMatch,
          });

          return hasMatch;
        });
        break;

      case "region":
        filteredAgents = filteredAgents.filter((agent) => {
          if (!gig.destination_zone) {
            return false;
          }

          // Comparaison des codes pays : destination_zone.cca2 vs timeZone.countryCode
          if (agent.availability?.timeZone && gig.destination_zone) {
            // Si les données sont populées, on peut comparer les codes pays
            if (gig.destination_zone.cca2 && agent.availability.timeZone.countryCode) {
              const gigCountryCode = gig.destination_zone.cca2;
              const agentCountryCode = agent.availability.timeZone.countryCode;
              
              if (gigCountryCode === agentCountryCode) {
                console.log("Region filtering - Country code match:", {
                  agentId: agent._id,
                  gigId: gig._id,
                  countryCode: gigCountryCode,
                  gigCountry: gig.destination_zone.name?.common,
                  agentTimezone: agent.availability.timeZone.zoneName
                });
                return true; // Match parfait
              }
            }
          }

          // Accepter les agents qui ont une timezone (même si pas de match parfait)
          if (agent.availability?.timeZone) {
            console.log("Region filtering - Agent has timezone:", {
              agentId: agent._id,
              gigId: gig._id,
              agentTimezone: agent.availability.timeZone.zoneName || agent.availability.timeZone.toString(),
              gigDestination: gig.destination_zone.name?.common || gig.destination_zone.toString()
            });
            return true;
          }

          console.log("Region filtering - No timezone info:", {
            agentId: agent._id,
            gigId: gig._id
          });

          return false; // Rejeter les agents sans timezone
        });
        break;
    }

    const afterCount = filteredAgents.length;
    filterResults[criterion] = {
      before: beforeCount,
      after: afterCount,
      removed: beforeCount - afterCount,
      skipped: false,
    };

    console.log(`After ${criterion} filter (weight: ${weight}):`, {
      before: beforeCount,
      after: afterCount,
      removed: beforeCount - afterCount,
    });
  }

  // Calculer les scores finaux pour les agents restants
  const matches = filteredAgents.map((agent) => {
    const { score, details } = calculateMatchScore(agent, gig, weights);
    
    // Convert agent to plain object if it's a Mongoose document
    const agentData = agent.toObject ? agent.toObject() : agent;
    
    // Extract agent information according to the Agent model structure
    const agentName = agentData.personalInfo?.name || agentData.name || 'Unknown';
    const agentEmail = agentData.personalInfo?.email || agentData.email || '';
    const agentPhone = agentData.personalInfo?.phone || agentData.phone || '';
    
    // Format timezone data for frontend
    const timeZone = agentData.availability?.timeZone || agentData.timezone || null;
    let formattedTimezone = null;
    if (timeZone) {
      const tz = typeof timeZone === 'object' && timeZone !== null ? timeZone : {};
      // Create gmtDisplay from gmtOffset (e.g., "+01:00" or "-05:00")
      // gmtOffset is typically in hours (e.g., 1.5 = 1 hour 30 minutes)
      const gmtOffset = tz.gmtOffset || 0;
      const sign = gmtOffset >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(gmtOffset));
      const minutes = Math.round((Math.abs(gmtOffset) % 1) * 60);
      const gmtDisplay = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      formattedTimezone = {
        timezoneId: tz._id || tz.timezoneId || '',
        timezoneName: tz.zoneName || tz.timezoneName || '',
        gmtOffset: gmtOffset,
        gmtDisplay: gmtDisplay,
        countryCode: tz.countryCode || '',
        countryName: tz.countryName || ''
      };
    }
    
    // Extract country from personalInfo.country (which may be a Timezone reference)
    let countryInfo = null;
    const countryRef = agentData.personalInfo?.country;
    if (countryRef) {
      const country = typeof countryRef === 'object' && countryRef !== null ? countryRef : {};
      // If it's a Timezone (as per schema), extract country info
      if (country.countryName || country.countryCode) {
        countryInfo = {
          name: country.countryName || '',
          code: country.countryCode || '',
          ...country
        };
      }
    }
    
    // Extract matching industries
    const agentIndustries = agentData.professionalSummary?.industries || [];
    const gigIndustries = gig.industries || [];
    const matchingIndustries = agentIndustries.filter((agentInd: any) => {
      const agentIndId = agentInd._id?.toString() || agentInd.toString();
      return gigIndustries.some((gigInd: any) => {
        const gigIndId = gigInd._id?.toString() || gigInd.toString();
        return agentIndId === gigIndId;
      });
    }).map((ind: any) => ({
      industry: ind._id || ind,
      industryName: ind.name || (typeof ind === 'string' ? ind : 'Unknown'),
      agentIndustryName: ind.name || (typeof ind === 'string' ? ind : 'Unknown')
    }));
    
    // Extract matching languages
    const agentLanguages = agentData.personalInfo?.languages || [];
    const gigLanguages = gig.skills?.languages || [];
    const matchingLanguages = agentLanguages.filter((agentLang: any) => {
      const agentLangId = agentLang.language?._id?.toString() || agentLang.language?.toString() || agentLang.language;
      return gigLanguages.some((gigLang: any) => {
        const gigLangId = gigLang.language?._id?.toString() || gigLang.language?.toString() || gigLang.language;
        return agentLangId === gigLangId;
      });
    }).map((lang: any) => ({
      language: lang.language?._id || lang.language,
      languageName: lang.language?.name || (typeof lang.language === 'string' ? lang.language : 'Unknown'),
      agentLevel: lang.proficiency || 'N/A',
      requiredLevel: gigLanguages.find((gl: any) => {
        const glId = gl.language?._id?.toString() || gl.language?.toString() || gl.language;
        const alId = lang.language?._id?.toString() || lang.language?.toString() || lang.language;
        return glId === alId;
      })?.level || 'N/A'
    }));
    
    // Extract matching skills
    const agentSkills = [
      ...(agentData.skills?.technical || []).map((s: any) => ({ ...s, type: 'technical' })),
      ...(agentData.skills?.professional || []).map((s: any) => ({ ...s, type: 'professional' })),
      ...(agentData.skills?.soft || []).map((s: any) => ({ ...s, type: 'soft' }))
    ];
    const gigSkills = [
      ...(gig.skills?.technical || []).map((s: any) => ({ ...s, type: 'technical' })),
      ...(gig.skills?.professional || []).map((s: any) => ({ ...s, type: 'professional' })),
      ...(gig.skills?.soft || []).map((s: any) => ({ ...s, type: 'soft' }))
    ];
    const matchingSkills = agentSkills.filter((agentSkill: any) => {
      const agentSkillId = agentSkill.skill?._id?.toString() || agentSkill.skill?.toString() || agentSkill.skill;
      return gigSkills.some((gigSkill: any) => {
        const gigSkillId = gigSkill.skill?._id?.toString() || gigSkill.skill?.toString() || gigSkill.skill;
        return agentSkillId === gigSkillId && agentSkill.type === gigSkill.type;
      });
    }).map((skill: any) => ({
      skill: skill.skill?._id || skill.skill,
      skillName: skill.skill?.name || (typeof skill.skill === 'string' ? skill.skill : 'Unknown'),
      agentLevel: skill.level || 0,
      requiredLevel: gigSkills.find((gs: any) => {
        const gsId = gs.skill?._id?.toString() || gs.skill?.toString() || gs.skill;
        const asId = skill.skill?._id?.toString() || skill.skill?.toString() || skill.skill;
        return gsId === asId && gs.type === skill.type;
      })?.level || 0,
      type: skill.type
    }));
    
    // Extract matching activities
    const agentActivities = agentData.professionalSummary?.activities || [];
    const gigActivities = gig.activities || [];
    const matchingActivities = agentActivities.filter((agentAct: any) => {
      const agentActId = agentAct._id?.toString() || agentAct.toString();
      return gigActivities.some((gigAct: any) => {
        const gigActId = gigAct._id?.toString() || gigAct.toString();
        return agentActId === gigActId;
      });
    }).map((act: any) => ({
      activity: act._id || act,
      activityName: act.name || (typeof act === 'string' ? act : 'Unknown'),
      agentActivityName: act.name || (typeof act === 'string' ? act : 'Unknown')
    }));
    
    // Format languages for frontend (with languageName)
    const formattedLanguages = (agentData.personalInfo?.languages || []).map((lang: any) => {
      const langObj = typeof lang.language === 'object' && lang.language !== null ? lang.language : {};
      return {
        _id: lang._id || langObj._id || '',
        language: lang.language?._id || lang.language || '',
        languageName: langObj.name || (typeof lang.language === 'string' ? lang.language : 'Unknown'),
        proficiency: lang.proficiency || 'N/A',
        iso639_1: langObj.iso639_1 || lang.iso639_1 || ''
      };
    });
    
    // Format industries for frontend (with name)
    const formattedIndustries = (agentData.professionalSummary?.industries || []).map((ind: any) => {
      const indObj = typeof ind === 'object' && ind !== null ? ind : {};
      return {
        id: ind._id?.toString() || ind.toString() || '',
        name: indObj.name || (typeof ind === 'string' ? ind : 'Unknown'),
        _id: ind._id || ind
      };
    });
    
    // Format activities for frontend (with name)
    const formattedActivities = (agentData.professionalSummary?.activities || []).map((act: any) => {
      const actObj = typeof act === 'object' && act !== null ? act : {};
      return {
        id: act._id?.toString() || act.toString() || '',
        name: actObj.name || (typeof act === 'string' ? act : 'Unknown'),
        _id: act._id || act
      };
    });
    
    // Format skills for frontend (with name for each skill)
    const formatSkills = (skillsArray: any[], type: string) => {
      return (skillsArray || []).map((skill: any) => {
        const skillObj = typeof skill.skill === 'object' && skill.skill !== null ? skill.skill : {};
        return {
          _id: skill._id || skillObj._id || '',
          skill: skill.skill?._id || skill.skill || '',
          name: skillObj.name || (typeof skill.skill === 'string' ? skill.skill : 'Unknown'),
          level: skill.level || 0,
          details: skill.details || '',
          type: type
        };
      });
    };
    
    return {
      agentId: agent._id,
      gigId: gig._id,
      score,
      totalMatchingScore: score, // Alias for frontend compatibility
      matchDetails: details,
      agentInfo: {
        // Include all agent data first
        ...agentData,
        // Then override with formatted/ensured properties
        _id: agent._id,
        name: agentName,
        email: agentEmail,
        phone: agentPhone,
        personalInfo: {
          ...(agentData.personalInfo || {}),
          name: agentName,
          email: agentEmail,
          phone: agentPhone,
          languages: formattedLanguages,
          country: countryInfo || agentData.personalInfo?.country
        },
        professionalSummary: {
          ...(agentData.professionalSummary || {}),
          yearsOfExperience: agentData.professionalSummary?.yearsOfExperience || 0,
          industries: formattedIndustries,
          activities: formattedActivities
        },
        skills: {
          technical: formatSkills(agentData.skills?.technical || [], 'technical'),
          professional: formatSkills(agentData.skills?.professional || [], 'professional'),
          soft: formatSkills(agentData.skills?.soft || [], 'soft'),
          contactCenter: agentData.skills?.contactCenter || []
        },
        availability: {
          ...(agentData.availability || {}),
          timeZone: formattedTimezone || agentData.availability?.timeZone
        },
        timezone: formattedTimezone,
        location: agentData.personalInfo?.city || agentData.location || ''
      },
      // Include detailed match breakdown for frontend
      skillsMatch: { 
        score: details?.skillsScore || 0,
        matching: matchingSkills,
        missing: [],
        details: {
          matchingSkills: matchingSkills,
          missingSkills: [],
          insufficientSkills: [],
          matchStatus: matchingSkills.length > 0 ? 'partial_match' : 'no_match'
        }
      },
      languageMatch: { 
        score: details?.languageScore || 0,
        matching: matchingLanguages,
        missing: [],
        details: {
          matchingLanguages: matchingLanguages,
          missingLanguages: [],
          insufficientLanguages: [],
          matchStatus: matchingLanguages.length > 0 ? 'partial_match' : 'no_match'
        }
      },
      industryMatch: { 
        score: details?.industryScore || 0,
        matching: details?.industryScore > 0,
        details: {
          matchingIndustries: matchingIndustries,
          missingIndustries: [],
          matchStatus: matchingIndustries.length > 0 ? 'perfect_match' : 'no_match'
        }
      },
      activityMatch: { 
        score: matchingActivities.length > 0 ? 1.0 : 0.0,
        matching: matchingActivities,
        details: {
          matchingActivities: matchingActivities,
          missingActivities: [],
          matchStatus: matchingActivities.length > 0 ? 'perfect_match' : 'no_match'
        }
      },
      experienceMatch: { 
        score: details?.experienceScore || 0,
        sufficient: details?.experienceScore > 0,
        details: {
          gigRequiredExperience: gig.seniority?.yearsExperience || 0,
          agentExperience: agentData.professionalSummary?.yearsOfExperience || 0,
          difference: (agentData.professionalSummary?.yearsOfExperience || 0) - (gig.seniority?.yearsExperience || 0),
          reason: details?.experienceScore > 0 ? 'Sufficient experience' : 'Insufficient experience',
          matchStatus: details?.experienceScore > 0 ? 'perfect_match' : 'no_match'
        }
      },
      timezoneMatch: { 
        score: details?.regionScore || 0, // Using regionScore as timezone is part of region
        matching: details?.regionScore > 0,
        details: {
          gigTimezone: gig.availability?.time_zone?.zoneName || 'N/A',
          agentTimezone: formattedTimezone?.timezoneName || 'N/A',
          gigGmtOffset: gig.availability?.time_zone?.gmtOffset,
          agentGmtOffset: formattedTimezone?.gmtOffset,
          gmtOffsetDifference: formattedTimezone?.gmtOffset && gig.availability?.time_zone?.gmtOffset 
            ? Math.abs(formattedTimezone.gmtOffset - gig.availability.time_zone.gmtOffset)
            : null,
          reason: formattedTimezone ? 'Timezone available' : 'No timezone data',
          matchStatus: formattedTimezone ? 'partial_match' : 'no_match'
        }
      },
      regionMatch: { 
        score: details?.regionScore || 0,
        matching: details?.regionScore > 0,
        details: {
          gigDestinationZone: gig.destination_zone?.name?.common || gig.destination_zone?.name || gig.destination_zone?.toString() || 'N/A',
          agentCountryCode: formattedTimezone?.countryCode || countryInfo?.code || 'N/A',
          agentCountryName: formattedTimezone?.countryName || countryInfo?.name || 'N/A',
          reason: formattedTimezone || countryInfo ? 'Region data available' : 'No region data',
          matchStatus: formattedTimezone || countryInfo ? 'partial_match' : 'no_match'
        }
      },
      availabilityMatch: { 
        score: details?.availabilityScore || 0,
        matching: details?.availabilityScore > 0,
        details: {
          gigAvailability: gig.availability?.schedule || [],
          agentAvailability: agentData.availability?.schedule || [],
          matchStatus: details?.availabilityScore > 0 ? 'partial_match' : 'no_match'
        }
      },
    };
  });

  const sortedMatches = matches.sort((a, b) => b.score - a.score);
  const qualifyingMatches = sortedMatches.filter(
    (match) => match.score >= minimumScore
  );
  const bestMatches = qualifyingMatches.slice(0, limit);

  return {
    matches: showAllScores ? sortedMatches : bestMatches,
    totalAgents: agents.length,
    qualifyingAgents: qualifyingMatches.length,
    matchCount: bestMatches.length,
    totalMatches: sortedMatches.length,
    filterResults,
    weights,
  };
};

/**
 * Trouve les meilleurs gigs pour un agent spécifique
 * @param {Object} agent - Le agent à matcher
 * @param {Array} gigs - Liste des gigs disponibles
 * @param {Object} weights - Poids personnalisés
 * @param {Object} options - Options de recherche
 * @returns {Object} Résultats de la recherche
 */
export const findGigsForAgent = async (
  agent,
  gigs = [],
  weights = {},
  options = {}
) => {
  const {
    limit = 10,
    minimumScore = 0.4,
    showAllScores = false,
    topScoreCount = 5,
  } = options;

  if (!agent) {
    throw new Error("Agent is required");
  }

  console.log("Finding gigs for agent:", {
    agentId: agent._id,
    agentIndustries: agent.professionalSummary?.industries,
    agentExperience: agent.professionalSummary?.yearsOfExperience,
    totalGigs: gigs.length,
  });

  if (!gigs || gigs.length === 0) {
    return {
      matches: [],
      totalGigs: 0,
      qualifyingGigs: 0,
      matchCount: 0,
      totalMatches: 0,
      minimumScoreApplied: minimumScore,
      scoreStats: {
        highest: 0,
        average: 0,
        qualifying: 0,
      },
    };
  }

  // Poids par défaut incluant l'expérience
  const defaultWeights = {
    industry: 0.20,
    experience: 0.20,
    skills: 0.20,
    language: 0.15,
    region: 0.15,
    availability: 0.10
  };

  const finalWeights = { ...defaultWeights, ...weights };

  // Filtrer d'abord les gigs qui ont une industrie correspondante à l'agent
  const industryMatches = gigs.filter((gig) => {
    if (
      !agent.professionalSummary ||
      !agent.professionalSummary.industries
    ) {
      console.log("Skipping gig due to missing agent data:", {
        gigId: gig._id,
        hasProfessionalSummary: !!agent.professionalSummary,
        hasIndustries: !!agent.professionalSummary?.industries,
      });
      return false;
    }

    // Nouveau schéma: vérifier gig.industries ou gig.category (backward compatibility)
    if (!gig.category && (!gig.industries || gig.industries.length === 0)) {
      console.log("Skipping gig due to missing industry data:", {
        gigId: gig._id,
        gigCategory: gig.category,
        gigIndustries: gig.industries,
      });
      return false;
    }

    const normalizeString = (str) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s+/g, "");
    };

    let isMatch = false;

    // Vérifier avec la catégorie (backward compatibility)
    if (gig.category) {
      const gigCategory = normalizeString(gig.category);
      isMatch = agent.professionalSummary.industries.some((industry) => {
        const normalizedIndustry = normalizeString(industry);
        const isExactMatch = normalizedIndustry === gigCategory;
        const isPartialMatch =
          normalizedIndustry.includes(gigCategory) ||
          gigCategory.includes(normalizedIndustry);
        return isExactMatch || isPartialMatch;
      });
    }

    // Vérifier avec les industries (nouveau schéma)
    if (!isMatch && gig.industries && gig.industries.length > 0) {
      isMatch = agent.professionalSummary.industries.some((agentIndustryId) => {
        return gig.industries.some(gigIndustryId => 
          gigIndustryId.toString() === agentIndustryId.toString()
        );
      });
    }

    console.log("Industry matching for gig:", {
      gigId: gig._id,
      gigCategory: gig.category,
      gigIndustries: gig.industries,
      agentIndustries: agent.professionalSummary.industries,
      isMatch,
    });

    return isMatch;
  });

  console.log("Industry matches found:", {
    total: industryMatches.length,
    matches: industryMatches.map((m) => ({
      gigId: m._id,
      category: m.category,
    })),
  });

  // Calculer les scores uniquement pour les gigs qui ont la même industrie
  const allMatches = industryMatches.map((gig) => {
    const matchResult = calculateMatchScore(agent, gig, finalWeights);
    return {
      agentId: agent._id,
      gigId: gig._id,
      score: matchResult.score,
      matchDetails: matchResult.details,
    };
  });

  // Filtrer les matches avec un score minimum
  const qualifyingMatches = allMatches.filter(
    (match) => match.score >= minimumScore
  );

  // Trier par score décroissant
  const sortedMatches = qualifyingMatches.sort((a, b) => b.score - a.score);

  // Limiter le nombre de résultats
  const limitedMatches = sortedMatches.slice(0, limit);

  // Calculer les top scores si demandé
  const topScores = showAllScores
    ? sortedMatches.slice(0, topScoreCount)
    : null;

  return {
    matches: limitedMatches,
    totalGigs: gigs.length,
    qualifyingGigs: qualifyingMatches.length,
    matchCount: limitedMatches.length,
    totalMatches: allMatches.length,
    minimumScoreApplied: minimumScore,
    industryMatches: industryMatches.length,
    topScores: topScores,
    topScoresCount: topScores ? topScores.length : 0,
    totalTopScoresAvailable: qualifyingMatches.length,
    scoreStats: {
      highest: Math.max(...allMatches.map((m) => m.score)),
      average:
        allMatches.reduce((sum, m) => sum + m.score, 0) / allMatches.length,
      qualifying: qualifyingMatches.length,
    },
  };
};

/**
 * Optimise les matches pour assurer la meilleure allocation globale
 * Version simplifiée de l'algorithme hongrois
 * @param {Array} agents - Liste des agents
 * @param {Array} gigs - Liste des gigs
 * @param {Object} weights - Poids personnalisés
 * @returns {Array} Liste des matches optimaux
 */
export const optimizeMatches = (agents, gigs, weights = {}) => {
  const matches = [];
  const matchedAgents = new Set();
  const matchedGigs = new Set();

  // Sort agents by their overall score potential
  const agentScores = agents.map((agent) => {
    const scores = gigs.map(
      (gig) => calculateMatchScore(agent, gig, weights).score
    );
    return {
      agent,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    };
  });

  const sortedAgents = agentScores.sort(
    (a, b) => b.averageScore - a.averageScore
  );

  // Match agents to gigs
  for (const { agent } of sortedAgents) {
    if (matchedAgents.has(agent._id)) continue;

    const gigMatches = gigs
      .filter((gig) => !matchedGigs.has(gig._id))
      .map((gig) => calculateMatchScore(agent, gig, weights))
      .sort((a, b) => b.score - a.score);

    if (gigMatches.length > 0) {
      const bestMatch = gigMatches[0];
      matches.push({
        agentId: agent._id,
        gigId: bestMatch.gig._id,
        score: bestMatch.score,
        matchDetails: bestMatch.details,
      });
      matchedAgents.add(agent._id);
      matchedGigs.add(bestMatch.gig._id);
    }
  }

  return matches;
};

/**
 * Formate le score en pourcentage
 * @param {number} score - Score à formater
 * @returns {string} Score formaté en pourcentage
 */
export function formatScore(score) {
  return `${Math.round(score * 100)}%`;
}

// Fonction utilitaire pour convertir les heures en minutes
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;

  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const findMatches = async (
  entity,
  candidates,
  weights,
  options = {}
) => {
  try {
    console.log("Starting matching process with weights:", weights);

    // Déterminer si on cherche des gigs pour un rep ou des reps pour un gig
    const isFindingGigs = "experience" in entity;
    console.log(
      "Matching type:",
      isFindingGigs ? "Finding gigs for rep" : "Finding reps for gig"
    );

    // Poids par défaut incluant l'expérience
    const defaultWeights = {
      industry: 0.20,
      experience: 0.20,
      skills: 0.20,
      language: 0.15,
      region: 0.15,
      availability: 0.10
    };

    const finalWeights = { ...defaultWeights, ...weights };

    // Trier les critères par poids décroissant
    const sortedCriteria = Object.entries(finalWeights)
      .sort(([, a], [, b]) => b - a)
      .filter(([, weight]) => weight >= 0.5);

    console.log("Sorted criteria by weight:", sortedCriteria);

    let matchingCandidates = [...candidates];
    const filterResults = {};

    // Filtrer les candidats selon les critères triés
    for (const [criterion, weight] of sortedCriteria) {
      const beforeCount = matchingCandidates.length;

      switch (criterion) {
        case "experience":
          matchingCandidates = matchingCandidates.filter((candidate) => {
            if (isFindingGigs) {
              // Chercher des gigs pour un rep
              const repExp = parseInt(entity.professionalSummary?.yearsOfExperience) || 0;
              const gigExp = parseInt(candidate.seniority?.yearsExperience) || 0;
              return repExp >= gigExp;
            } else {
              // Chercher des reps pour un gig
              const repExp = parseInt(candidate.professionalSummary?.yearsOfExperience) || 0;
              const gigExp = parseInt(entity.seniority?.yearsExperience) || 0;
              return repExp >= gigExp;
            }
          });
          break;

        case "skills":
          matchingCandidates = matchingCandidates.filter((candidate) => {
            if (isFindingGigs) {
              // Chercher des gigs pour un rep
              const requiredSkills = [
                ...candidate.skills.professional,
                ...candidate.skills.technical,
                ...candidate.skills.soft,
              ];
              return requiredSkills.some((skill) =>
                entity.skills.includes(skill)
              );
            } else {
              // Chercher des reps pour un gig
              const requiredSkills = [
                ...entity.skills.professional,
                ...entity.skills.technical,
                ...entity.skills.soft,
              ];
              return requiredSkills.some((skill) =>
                candidate.skills.includes(skill)
              );
            }
          });
          break;

        case "language":
          matchingCandidates = matchingCandidates.filter((candidate) => {
            if (isFindingGigs) {
              // Chercher des gigs pour un rep
              const repLanguages = entity.personalInfo.languages.map(
                (lang) => lang.name
              );
              const requiredLanguages = candidate.skills.languages.map(
                (lang) => lang.name
              );
              return requiredLanguages.some((lang) =>
                repLanguages.includes(lang)
              );
            } else {
              // Chercher des reps pour un gig
              const repLanguages = candidate.personalInfo.languages.map(
                (lang) => lang.name
              );
              const requiredLanguages = entity.skills.languages.map(
                (lang) => lang.name
              );
              return requiredLanguages.some((lang) =>
                repLanguages.includes(lang)
              );
            }
          });
          break;

        case "availability":
          matchingCandidates = matchingCandidates.filter((candidate) => {
            if (isFindingGigs) {
              // Chercher des gigs pour un rep
              const gigSchedule = JSON.parse(candidate.schedule.hours);
              const repAvailability = entity.availability;
              return Object.entries(gigSchedule).every(([day, hours]) => {
                if (!hours) return true;
                return repAvailability.some(
                  (avail) =>
                    avail.day === day &&
                    avail.startTime <= hours.start &&
                    avail.endTime >= hours.end
                );
              });
            } else {
              // Chercher des reps pour un gig
              const gigSchedule = JSON.parse(entity.schedule.hours);
              const repAvailability = candidate.availability;
              return Object.entries(gigSchedule).every(([day, hours]) => {
                if (!hours) return true;
                return repAvailability.some(
                  (avail) =>
                    avail.day === day &&
                    avail.startTime <= hours.start &&
                    avail.endTime >= hours.end
                );
              });
            }
          });
          break;

        case "industry":
          // Ignorer l'industrie car son poids est trop faible
          break;
      }

      const afterCount = matchingCandidates.length;
      filterResults[criterion] = {
        before: beforeCount,
        after: afterCount,
        removed: beforeCount - afterCount,
      };
      console.log(
        `After ${criterion} filtering: ${beforeCount} -> ${afterCount} candidates`
      );
    }

    // Calculer les scores de correspondance pour les candidats restants
    const scoredCandidates = matchingCandidates.map((candidate) => {
      const { score, details } = calculateMatchScore(
        isFindingGigs ? entity : candidate,
        isFindingGigs ? candidate : entity,
        weights
      );
      return {
        [isFindingGigs ? "gigId" : "repId"]: candidate._id,
        score,
        matchDetails: details,
      };
    });

    // Trier par score décroissant
    const sortedMatches = scoredCandidates.sort((a, b) => b.score - a.score);

    // Appliquer le score minimum si spécifié
    const minimumScore = options.minimumScore || 0.4;
    const qualifyingMatches = sortedMatches.filter(
      (match) => match.score >= minimumScore
    );

    // Limiter le nombre de résultats si spécifié
    const limit = options.limit || 10;
    const limitedMatches = qualifyingMatches.slice(0, limit);

    return {
      matches: limitedMatches,
      totalCandidates: candidates.length,
      qualifyingCandidates: qualifyingMatches.length,
      matchCount: limitedMatches.length,
      totalMatches: sortedMatches.length,
      filterResults,
      weights,
    };
  } catch (error) {
    console.error("Error in findMatches:", error);
    throw error;
  }
};

/**
 * Convertit les niveaux de langue en scores numériques
 * @param {string} level - Niveau de langue (A1, A2, B1, B2, C1, C2, Native)
 * @returns {number} Score entre 0 et 1
 */
export const getLanguageLevelScore = (level) => {
  const levelMap = {
    'A1': 0.1,  // Débutant
    'a1': 0.1,  // Débutant
    'A2': 0.2,  // Élémentaire
    'a2': 0.2,  // Élémentaire
    'B1': 0.4,  // Intermédiaire
    'b1': 0.4,  // Intermédiaire
    'B2': 0.6,  // Intermédiaire avancé
    'b2': 0.6,  // Intermédiaire avancé
    'C1': 0.8,  // Avancé
    'c1': 0.8,  // Avancé
    'C2': 1.0,  // Maîtrise
    'c2': 1.0,  // Maîtrise
    'Native': 1.0,  // Langue maternelle
    'native': 1.0,  // Langue maternelle
    'natif': 1.0,  // Langue maternelle
    'fluent': 0.9,  // Courant
    'avancé': 0.8,  // Avancé
    'advanced': 0.8,  // Avancé
    'intermediate': 0.5,  // Intermédiaire
    'intermédiaire': 0.5,  // Intermédiaire
    'beginner': 0.2,  // Débutant
    'débutant': 0.2,  // Débutant
    'conversational': 0.5,  // Conversationnel
    'professional': 0.8,  // Professionnel
    'langue maternelle': 1.0,  // Langue maternelle
    'bonne maîtrise': 0.8,  // Bonne maîtrise
    'maîtrise professionnelle': 0.6,  // Maîtrise professionnelle
    'maîtrise limitée': 0.4,  // Maîtrise limitée
    'maîtrise élémentaire': 0.2,  // Maîtrise élémentaire
  };
  return levelMap[level] || 0;
};

/**
 * Trouve les agents qui matchent les langues requises pour un gig
 * Cette fonction compare les langues requises par le gig avec les langues maîtrisées par chaque agent
 * et retourne uniquement les agents qui satisfont tous les critères linguistiques.
 * 
 * @param {Object} gig - Le gig avec ses langues requises dans gig.skills.languages
 * @param {Array} agents - Liste des agents à évaluer, chacun avec ses langues dans personalInfo.languages
 * @returns {Array} Liste des agents qui matchent avec leurs scores et détails de matching
 */
export const findLanguageMatches = (gig, agents) => {
  // Vérification des paramètres d'entrée
  if (!gig?.skills?.languages || !Array.isArray(agents)) return [];

  // Évaluation de chaque agent
  return agents.map(agent => {
    // Cas où l'agent n'a pas de langues définies
    if (!agent?.personalInfo?.languages) {
      return {
        agent,
        score: 0,
        details: {
          matchingLanguages: [],
          missingLanguages: gig.skills.languages,
          insufficientLanguages: [],
          matchStatus: "missing_data"
        }
      };
    }

    // Initialisation des tableaux pour stocker les résultats du matching
    const matchingLanguages = [];    // Langues qui correspondent parfaitement
    const missingLanguages = [];     // Langues manquantes chez l'agent
    const insufficientLanguages = []; // Langues présentes mais niveau insuffisant

    // Vérification de chaque langue requise par le gig
    gig.skills.languages.forEach(gigLang => {
      const gigLangId = gigLang.language?.toString();
      const gigLevel = gigLang.proficiency?.toLowerCase();

      // Recherche de la langue chez l'agent par ID
      const agentLang = agent.personalInfo.languages.find(agentLang => {
        const agentLangId = agentLang.language?.toString();
        return agentLangId === gigLangId;
      });

      // Si la langue n'est pas trouvée chez l'agent
      if (!agentLang) {
        missingLanguages.push({
          languageId: gigLangId,
          requiredLevel: gigLang.proficiency
        });
        return;
      }

      const agentLevel = agentLang.proficiency?.toLowerCase();

      // Fonction helper pour comparer les niveaux de langue de manière hiérarchique
      // Niveaux CEFR : A1 < A2 < B1 < B2 < C1 < C2 < Native
      const getLevelValue = (level: string): number => {
        const normalizedLevel = level.toLowerCase().trim();
        if (normalizedLevel.includes('native') || normalizedLevel.includes('bilingual')) return 7;
        if (normalizedLevel === 'c2') return 6;
        if (normalizedLevel === 'c1') return 5;
        if (normalizedLevel === 'b2') return 4;
        if (normalizedLevel === 'b1') return 3;
        if (normalizedLevel === 'a2') return 2;
        if (normalizedLevel === 'a1') return 1;
        // Niveaux alternatifs
        if (normalizedLevel.includes('professional working') || normalizedLevel === 'professional') return 5;
        if (normalizedLevel === 'conversational' || normalizedLevel === 'fluent') return 4;
        if (normalizedLevel === 'intermediate' || normalizedLevel === 'intermédiaire') return 3;
        if (normalizedLevel === 'beginner' || normalizedLevel === 'débutant') return 1;
        return 0;
      };

      // Vérifier le niveau de compétence
      // Un agent avec un niveau supérieur ou égal au niveau requis est acceptable
      const gigLevelValue = getLevelValue(gigLevel);
      const agentLevelValue = getLevelValue(agentLevel);
      
      // Match si le niveau de l'agent est supérieur ou égal au niveau requis
      const isLevelMatch = agentLevelValue >= gigLevelValue && agentLevelValue > 0;
      
      // Fallback pour les anciennes valeurs textuelles
      const isLevelMatchFallback =
        (gigLevel === "conversational" && 
          ["professional working", "native or bilingual", "c1", "c2", "b2"].includes(agentLevel)) ||
        (gigLevel === "professional" && 
          ["professional working", "native or bilingual", "c1", "c2"].includes(agentLevel)) ||
        (gigLevel === "native" && 
          ["native or bilingual", "c2"].includes(agentLevel));
      
      const finalIsLevelMatch = isLevelMatch || isLevelMatchFallback;

      // Si le niveau correspond, ajouter aux langues matching
      if (finalIsLevelMatch) {
        matchingLanguages.push({
          languageId: gigLangId,
          requiredLevel: gigLang.proficiency,
          agentLevel: agentLang.proficiency
        });
      } else {
        // Si le niveau ne correspond pas, ajouter aux langues insuffisantes
        insufficientLanguages.push({
          languageId: gigLangId,
          requiredLevel: gigLang.proficiency,
          agentLevel: agentLang.proficiency
        });
      }
    });

    // Calculer le score et le statut basé sur les langues qui matchent
    const totalRequiredLanguages = gig.skills.languages.length;
    const totalMatchingLanguages = matchingLanguages.length;
    
    let score = 0;
    let matchStatus = "no_match";
    
    if (totalMatchingLanguages === 0) {
      // Aucune langue ne matche
      score = 0;
      matchStatus = "no_match";
    } else if (totalMatchingLanguages === totalRequiredLanguages) {
      // Toutes les langues matchent
      score = 1;
      matchStatus = "perfect_match";
    } else {
      // Au moins une langue matche, mais pas toutes
      score = totalMatchingLanguages / totalRequiredLanguages;
      matchStatus = "partial_match";
    }

    // Retourner le résultat pour cet agent
    return {
      agent,
      score: score,
      details: {
        matchingLanguages,
        missingLanguages,
        insufficientLanguages,
        matchStatus: matchStatus
      }
    };
  }).filter(match => match.score > 0); // Garder les agents avec au moins une langue commune
};
