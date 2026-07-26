-- Clean up existing data for fresh rich seed
TRUNCATE TABLE visits CASCADE;
TRUNCATE TABLE patients CASCADE;

-- Insert Patients
INSERT INTO patients (id, name, age, gender, phone, address, medical_history, created_at) VALUES
('P-1001', 'Rajesh Sharma', 45, 'MALE', '9876543210', '123 MG Road, Connaught Place, New Delhi', 'Type 2 Diabetes Mellitus (5 yrs), Mild Hypertension', NOW() - INTERVAL '10 days'),
('P-1002', 'Sunita Gupta', 38, 'FEMALE', '9812345678', '45 Park Street, Chowringhee, Kolkata', 'Gastroesophageal Reflux Disease (GERD)', NOW() - INTERVAL '9 days'),
('P-1003', 'Amit Patel', 52, 'MALE', '9988776655', '78 Satellite Road, Bodakdev, Ahmedabad', 'Bronchial Asthma (10 yrs), Dyslipidemia', NOW() - INTERVAL '8 days'),
('P-1004', 'Priya Nair', 29, 'FEMALE', '9765432109', '12 Indiranagar 100ft Road, Bengaluru', 'Migraine without Aura, Tension Headaches', NOW() - INTERVAL '7 days'),
('P-1005', 'Vikram Singh', 61, 'MALE', '9123456789', '90 Civil Lines, C-Scheme, Jaipur', 'Primary Osteoarthritis Knee Joint, Chronic Back Pain', NOW() - INTERVAL '6 days'),
('P-1006', 'Ananya Iyer', 34, 'FEMALE', '9871122334', '56 T. Nagar, Pondy Bazaar, Chennai', 'Hypothyroidism (3 yrs)', NOW() - INTERVAL '5 days'),
('P-1007', 'Rohan Kulkarni', 26, 'MALE', '9711889900', '34 Deccan Gymkhana, FC Road, Pune', 'Tinea Corporis Fungal Infection', NOW() - INTERVAL '4 days'),
('P-1008', 'Kavita Reddy', 48, 'FEMALE', '9900112233', '89 Banjara Hills Road No 12, Hyderabad', 'Essential Hypertension (4 yrs), Fatty Liver Grade 1', NOW() - INTERVAL '3 days'),
('P-1009', 'Deepak Deshmukh', 58, 'MALE', '9822334455', '12 Kothrud Stand, Paud Road, Pune', 'Ischemic Heart Disease (Angina), Diabetes Type 2', NOW() - INTERVAL '2 days'),
('P-1010', 'Meera Banerjee', 41, 'FEMALE', '9833445566', '67 Salt Lake Sector 5, Kolkata', 'Acute Bronchitis, Seasonal Rhinitis', NOW() - INTERVAL '1 day');

-- Insert Visits
INSERT INTO visits (id, patient_id, date, symptoms, diagnosis, notes, bp, weight, temp) VALUES
('v-2001', 'P-1001', NOW() - INTERVAL '5 days', 'Heel pain in the morning, severe pain on taking first steps after waking up', 'Plantar Fasciitis (Inferior Calcaneal Heel Pain)', 'Advise plantar fascia stretching exercises, silicone heel cushions, supportive footwear, ice massage, and avoidance of barefoot walking.', '130/85', '74', '98.4'),

('v-2002', 'P-1002', NOW() - INTERVAL '4 days', 'Heartburn, retrosternal burning pain after meals, acid regurgitation', 'Acid Peptic Disease / Gastroesophageal Reflux (GERD)', 'Encourage small frequent meals, avoid caffeine, alcohol, and spicy fried food. Elevate head end of bed.', '122/78', '62', '98.6'),

('v-2003', 'P-1003', NOW() - INTERVAL '3 days', 'Dry cough, wheezing on exertion, mild shortness of breath', 'Bronchial Asthma Exacerbation', 'Use inhaler as demonstrated. Avoid dust exposure, wear mask outdoors, steam inhalation twice daily.', '128/82', '78', '98.8'),

('v-2004', 'P-1004', NOW() - INTERVAL '2 days', 'Severe throbbing unilateral headache, nausea, sensitivity to light', 'Migraine without Aura', 'Advise adequate hydration, dark quiet room rest during attacks, avoid migraine triggers (caffeine, irregular sleep).', '118/76', '54', '98.2'),

('v-2005', 'P-1005', NOW() - INTERVAL '1 day', 'Right knee pain, crepitus on folding knee, difficulty climbing stairs', 'Primary Osteoarthritis Knee Joint', 'Advise weight reduction, quadriceps strengthening exercises, knee binder support, avoid squatting on floor.', '134/86', '84', '98.4');
