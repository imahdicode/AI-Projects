import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  return (
    localStorage.getItem('mediscript_gemini_api_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    ''
  );
};

const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Comprehensive Medical Knowledge Rule Engine
const getFallbackSymptomAnalysis = (symptoms: string, age: number, gender: string) => {
  const s = symptoms.toLowerCase();

  // 1. Foot / Heel / Musculoskeletal Pain
  if (s.includes('plantar') || s.includes('fasciitis') || s.includes('heel') || s.includes('foot pain') || s.includes('sole pain')) {
    return {
      possibleConditions: [
        'Plantar Fasciitis (Inferior Calcaneal Heel Pain)',
        'Calcaneal Spur / Retrocalcaneal Bursitis',
        'Tarsal Tunnel Syndrome / Plantar Fascial Strain'
      ],
      recommendedChecks: [
        'Weight-Bearing X-Ray Foot & Heel (Lateral View)',
        'Ultrasound Soft Tissue Heel / Foot',
        'Serum Uric Acid Level (Rule out Gouty Arthritis)'
      ],
      advice: `Advise plantar fascia stretching exercises, silicone heel pads, supportive cushioned footwear, ice massage, and avoidance of barefoot walking.`
    };
  }

  if (s.includes('back pain') || s.includes('sciatica') || s.includes('spine') || s.includes('lumbar')) {
    return {
      possibleConditions: [
        'Acute Lumbar Musculoskeletal Strain',
        'Lumbar Disc Herniation / Sciatica',
        'Lumbar Spondylosis'
      ],
      recommendedChecks: [
        'Straight Leg Raise Test (SLR)',
        'X-Ray Lumbar Spine (AP & Lateral)',
        'MRI Lumbar Spine (if neurological deficit)'
      ],
      advice: 'Advise firm bed rest during acute phase, lumbar support belt, warm compress, and avoidance of forward bending & heavy lifting.'
    };
  }

  if (s.includes('knee') || s.includes('joint pain') || s.includes('gout') || s.includes('arthritis')) {
    return {
      possibleConditions: [
        'Primary Osteoarthritis Knee Joint',
        'Acute Gouty Arthritis',
        'Meniscal / Ligamentous Knee Strain'
      ],
      recommendedChecks: [
        'Weight-Bearing X-Ray Both Knees AP View',
        'Serum Uric Acid & ESR / CRP',
        'Rheumatoid Factor (RF)'
      ],
      advice: 'Advise weight reduction, quadriceps strengthening exercises, knee support binder, and low-purine diet.'
    };
  }

  // 2. Dermatology / Skin
  if (s.includes('rash') || s.includes('skin') || s.includes('itching') || s.includes('eczema') || s.includes('fungal') || s.includes('ringworm')) {
    return {
      possibleConditions: [
        'Tinea Corporis / Fungal Dermatophytosis',
        'Allergic Contact Dermatitis',
        'Acute Urticaria / Eczematous Dermatitis'
      ],
      recommendedChecks: [
        'Skin Scraping for KOH Examination',
        'Serum IgE Allergy Panel',
        'Complete Blood Count (Eosinophil Count)'
      ],
      advice: 'Advise keeping skin clean & dry, wearing loose cotton clothing, avoiding scratching, and using mild soap.'
    };
  }

  // 3. Respiratory / Fever
  if (s.includes('fever') || s.includes('cough') || s.includes('cold') || s.includes('chills') || s.includes('flu')) {
    return {
      possibleConditions: [
        'Acute Upper Respiratory Tract Infection (URTI)',
        'Acute Bronchitis',
        'Viral Influenza / Febrile Prodrome'
      ],
      recommendedChecks: [
        'Body Temperature & SpO2 Monitoring',
        'Complete Blood Count (CBC)',
        'Chest X-Ray PA View (if fever > 3 days)'
      ],
      advice: `Patient (${age}y, ${gender}) presents with febrile respiratory symptoms. Recommend warm fluid intake, steam inhalation, and antipyretics.`
    };
  }

  // 4. Cardiac / Chest Pain
  if (s.includes('chest pain') || s.includes('breathless') || s.includes('palpitation') || s.includes('angina')) {
    return {
      possibleConditions: [
        'Ischemic Heart Disease / Angina Pectoris',
        'Gastroesophageal Reflux Disease (GERD)',
        'Costochondritis / Musculoskeletal Wall Pain'
      ],
      recommendedChecks: [
        '12-Lead Electrocardiogram (ECG)',
        'Serum Troponin-I / CK-MB',
        'Blood Pressure & Echocardiogram'
      ],
      advice: 'CRITICAL EVALUATION: Perform immediate 12-lead ECG. Exclude acute coronary syndrome before symptomatic treatment.'
    };
  }

  // 5. Gastrointestinal / Stomach
  if (s.includes('stomach') || s.includes('vomit') || s.includes('diarrhea') || s.includes('acidity') || s.includes('gas') || s.includes('abdominal')) {
    return {
      possibleConditions: [
        'Acid Peptic Disease / GERD / Gastritis',
        'Acute Gastroenteritis',
        'Functional Dyspepsia'
      ],
      recommendedChecks: [
        'Abdominal Palpation & Rebound Exam',
        'Ultrasound Abdomen & Pelvis',
        'Serum Electrolytes & Stool Routine'
      ],
      advice: 'Encourage Oral Rehydration Solution (ORS), bland non-spicy diet. Avoid alcohol, caffeine, and NSAIDs.'
    };
  }

  // 6. Neurological / Headache
  if (s.includes('headache') || s.includes('dizzy') || s.includes('giddiness') || s.includes('migraine')) {
    return {
      possibleConditions: [
        'Tension-Type Headache',
        'Migraine without Aura',
        'Benign Paroxysmal Positional Vertigo (BPPV)'
      ],
      recommendedChecks: [
        'Blood Pressure Measurement',
        'Neurological Exam & Cranial Nerves',
        'Refraction & Fundoscopy'
      ],
      advice: 'Evaluate BP and hydration status. Advise adequate sleep, dark quiet rest during attacks, and stress reduction.'
    };
  }

  // 7. Urinary / Renal
  if (s.includes('urine') || s.includes('burning') || s.includes('kidney') || s.includes('flank') || s.includes('uti')) {
    return {
      possibleConditions: [
        'Acute Urinary Tract Infection (UTI)',
        'Renal Calculi / Nephrolithiasis',
        'Acute Cystitis'
      ],
      recommendedChecks: [
        'Urine Routine & Microscopy',
        'Ultrasound KUB (Kidney, Ureter, Bladder)',
        'Renal Function Test (KFT)'
      ],
      advice: 'Advise high fluid intake (> 3 Liters water/day), urinary alkalinizers, and complete antibiotic compliance.'
    };
  }

  // General Fallback
  const cleanSymptomName = symptoms.trim().charAt(0).toUpperCase() + symptoms.trim().slice(1);
  return {
    possibleConditions: [
      `${cleanSymptomName} - Differential Clinical Assessment`,
      'Non-Specific Symptom Presentation',
      'Viral Prodrome / General Fatigue'
    ],
    recommendedChecks: [
      'Vital Signs (BP, Temp, Pulse, SpO2)',
      'Baseline Complete Blood Count (CBC)'
    ],
    advice: `Clinical assessment for ${symptoms}. Correlate with physical examination and vital trends.`
  };
};

export const geminiService = {
  analyzeSymptoms: async (symptoms: string, age: number, gender: string, history: string) => {
    const client = getClient();

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Act as an expert clinical assistant. A patient (${age} years old, ${gender}) presents with: "${symptoms}". 
          Medical History: "${history}".
          Provide a JSON response with the following fields:
          - "possibleConditions": array of strings (top 3 potential diagnoses)
          - "recommendedChecks": array of strings (vitals or labs to check)
          - "advice": string (brief clinical advice for the doctor)
          
          Keep it concise and professional. Do not provide definitive medical advice, only suggestions for the doctor.`,
          config: {
            responseMimeType: "application/json"
          }
        });
        return JSON.parse(response.text);
      } catch (error) {
        console.warn("Gemini Live API call failed, switching to Built-in Medical Rule Engine:", error);
      }
    }

    return getFallbackSymptomAnalysis(symptoms, age, gender);
  },

  suggestMedicines: async (diagnosis: string) => {
    const client = getClient();

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Suggest 3 common medicines for the diagnosis: "${diagnosis}".
          Return a JSON array where each object has:
          - "medicine": string (generic name)
          - "dosage": string (typical adult dosage)
          - "frequency": string (e.g. Twice daily)
          - "instructions": string (e.g. After food)
          
          Disclaimer: This is for reference only.`,
          config: {
            responseMimeType: "application/json"
          }
        });
        return JSON.parse(response.text);
      } catch (error) {
        console.warn("Gemini Live API call failed, switching to Built-in Medicine Suggestions:", error);
      }
    }

    // Comprehensive Fallback medicines based on diagnosis keywords
    const d = diagnosis.toLowerCase();

    if (d.includes('plantar') || d.includes('heel') || d.includes('foot') || d.includes('gout') || d.includes('arthritis')) {
      return [
        { medicine: 'Aceclofenac 100mg + Paracetamol 325mg', dosage: '1 tablet', frequency: 'Twice daily', instructions: 'After food for 5 days' },
        { medicine: 'Methylcobalamin & Calcium Supplement', dosage: '1 tablet', frequency: 'Once daily', instructions: 'After dinner' },
        { medicine: 'Diclofenac Topical Pain Gel', dosage: 'Apply gently to heel/foot', frequency: 'Thrice daily', instructions: 'For external local application' }
      ];
    }

    if (d.includes('back') || d.includes('sciatica') || d.includes('joint') || d.includes('sprain')) {
      return [
        { medicine: 'Thiocolchicoside 4mg + Aceclofenac 100mg', dosage: '1 tablet', frequency: 'Twice daily', instructions: 'After food' },
        { medicine: 'Pantoprazole 40mg', dosage: '1 tablet', frequency: 'Once daily', instructions: '30 mins before breakfast' },
        { medicine: 'Topical Pain Relief Spray / Gel', dosage: 'Apply to affected area', frequency: 'Thrice daily', instructions: 'External use' }
      ];
    }

    if (d.includes('skin') || d.includes('fungal') || d.includes('tinea') || d.includes('rash')) {
      return [
        { medicine: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily at bedtime', instructions: 'After food' },
        { medicine: 'Itraconazole 100mg', dosage: '1 capsule', frequency: 'Twice daily', instructions: 'After heavy meals for 7 days' },
        { medicine: 'Luliconazole 1% Cream', dosage: 'Apply thin layer', frequency: 'Once daily', instructions: 'On clean dry skin' }
      ];
    }

    if (d.includes('bronchitis') || d.includes('cough') || d.includes('urti') || d.includes('cold')) {
      return [
        { medicine: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Thrice daily', instructions: 'After food' },
        { medicine: 'Levosalbutamol & Ambroxol Syrup', dosage: '10 ml', frequency: 'Thrice daily', instructions: 'After food' },
        { medicine: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily', instructions: 'For 5 days after food' }
      ];
    }

    if (d.includes('gastritis') || d.includes('acidity') || d.includes('gerd') || d.includes('ulcer')) {
      return [
        { medicine: 'Pantoprazole 40mg', dosage: '1 tablet', frequency: 'Once daily', instructions: '30 mins before breakfast' },
        { medicine: 'Magaldrate + Simethicone Oral Gel', dosage: '10 ml', frequency: 'Thrice daily', instructions: '1 hour after meals' },
        { medicine: 'Domperidone 10mg', dosage: '1 tablet', frequency: 'Twice daily', instructions: 'Before food' }
      ];
    }

    return [
      { medicine: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'As needed (SOS)', instructions: 'After food' },
      { medicine: 'Multivitamin & Mineral Tab', dosage: '1 tablet', frequency: 'Once daily', instructions: 'After breakfast' },
      { medicine: 'Pantoprazole 40mg', dosage: '1 tablet', frequency: 'Once daily', instructions: 'Before food' }
    ];
  }
};