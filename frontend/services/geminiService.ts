import { fetchAPI } from './apiService';

// Comprehensive Medical Knowledge Rule Engine Fallback
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
      advice: 'Advise adequate oral hydration, steam inhalation, rest, body temperature monitoring, and double-masking.'
    };
  }

  // 4. Gastroenterology
  if (s.includes('acidity') || s.includes('gas') || s.includes('stomach') || s.includes('vomiting') || s.includes('nausea') || s.includes('gerd')) {
    return {
      possibleConditions: [
        'Gastroesophageal Reflux Disease (GERD)',
        'Acute Dyspepsia / Non-Ulcer Gastritis',
        'Acute Gastroenteritis'
      ],
      recommendedChecks: [
        'Abdominal Palpation & Bowel Sounds',
        'Serum Electrolytes & LFT',
        'USG Abdomen (if recurrent right upper quadrant pain)'
      ],
      advice: 'Advise small frequent bland meals, avoiding spicy & fatty foods, avoiding lying down immediately after meals, and elevating head of bed.'
    };
  }

  return {
    possibleConditions: [
      'Acute Musculoskeletal Strain',
      'Viral Febrile Prodrome / General Fatigue',
      'Non-Specific Functional Symptomatology'
    ],
    recommendedChecks: [
      'Vital Signs (BP, Temp, Pulse, SpO2)',
      'Baseline Complete Blood Count (CBC)'
    ],
    advice: `Clinical assessment for ${symptoms}. Correlate with physical examination and vital trends.`
  };
};

export const geminiService = {
  analyzeSymptoms: async (symptoms: string, age: number, gender: string, history?: string) => {
    try {
      const data = await fetchAPI<any>('/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ symptoms, age, gender })
      });
      if (data && data.possibleConditions) {
        return data;
      }
    } catch (error) {
      console.warn("Backend AI Gateway unreachable, switching to Built-in Rule Engine:", error);
    }

    return getFallbackSymptomAnalysis(symptoms, age, gender);
  },

  suggestMedicines: async (diagnosis: string) => {
    try {
      const data = await fetchAPI<any>('/api/ai/suggest-medicines', {
        method: 'POST',
        body: JSON.stringify({ diagnosis })
      });
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.warn("Backend AI Gateway unreachable, switching to Built-in Medicine Suggestions:", error);
    }

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