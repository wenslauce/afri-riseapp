// Static list of all 54 African countries with their IDs from the database
// This is used during registration when users are not yet authenticated

export interface AfricanCountry {
  id: string;
  name: string;
  code: string;
}

export const AFRICAN_COUNTRIES: AfricanCountry[] = [
  { id: "7e2db0e4-9864-40a4-95e8-78e106f49344", name: "Algeria", code: "DZ" },
  { id: "410cc8ac-f4d0-445f-835e-d4e3a39bb1d9", name: "Angola", code: "AO" },
  { id: "e0f8f141-1586-4b4c-9208-12416406afbc", name: "Benin", code: "BJ" },
  { id: "27c0ef29-6c47-43ae-9eaa-86f972a291f2", name: "Botswana", code: "BW" },
  { id: "c7fbcc0c-fb6a-4490-80d5-99365a5a3176", name: "Burkina Faso", code: "BF" },
  { id: "2993bec3-7032-492e-b29c-127483e669b3", name: "Burundi", code: "BI" },
  { id: "5e87f279-b990-4ba5-8405-fe3878a24399", name: "Cameroon", code: "CM" },
  { id: "4417c02e-7027-474d-a92b-ee728d2dfb76", name: "Cape Verde", code: "CV" },
  { id: "76d6feef-bf28-4f96-88c2-d8d18437ffaa", name: "Central African Republic", code: "CF" },
  { id: "f29f53b2-6478-443c-a5fc-e281d615d33c", name: "Chad", code: "TD" },
  { id: "616fc72d-7c38-4adb-9861-23f94ebf8b84", name: "Comoros", code: "KM" },
  { id: "d4d8f44e-2623-494c-aab9-a47faa33c54e", name: "Democratic Republic of Congo", code: "CD" },
  { id: "4f8c8443-34be-4bc7-9e65-590ba6ec9945", name: "Djibouti", code: "DJ" },
  { id: "6a75c85d-e9e7-4790-a612-31c87a6c277b", name: "Egypt", code: "EG" },
  { id: "1504b89a-3921-43db-82f7-c5923141bd3d", name: "Equatorial Guinea", code: "GQ" },
  { id: "1da77e52-9287-419d-a06d-9520bfb4fd22", name: "Eritrea", code: "ER" },
  { id: "a24ff07b-d658-4de3-8aff-37c7aa01409b", name: "Eswatini", code: "SZ" },
  { id: "637b385b-039a-40c3-9866-1471577a90eb", name: "Ethiopia", code: "ET" },
  { id: "f094ea98-8ad7-4d73-8339-4989a7a6bdef", name: "Gabon", code: "GA" },
  { id: "2e028315-c623-47b4-bb28-9ac92d3c3981", name: "Gambia", code: "GM" },
  { id: "9c8520c0-0e27-4e8c-9d42-208e4c6383a7", name: "Ghana", code: "GH" },
  { id: "ce543a2d-08aa-44e6-84c5-2dcf3c8eee74", name: "Guinea", code: "GN" },
  { id: "4b94a5bb-8aea-4fef-86dc-c72f071dffaa", name: "Guinea-Bissau", code: "GW" },
  { id: "0913f41d-dbf1-434a-8359-606955a7f7a1", name: "Ivory Coast", code: "CI" },
  { id: "ab31c2e1-3286-4b85-bb63-e44f8b61d261", name: "Kenya", code: "KE" },
  { id: "f8ecc0f8-1a75-4800-adbf-33a4f97f5dda", name: "Lesotho", code: "LS" },
  { id: "8dc7a12a-9ec2-4ec2-b42e-3604aa1202ae", name: "Liberia", code: "LR" },
  { id: "16bf7227-89c1-4c51-8ab9-de2af5d47aec", name: "Libya", code: "LY" },
  { id: "eec0c8e2-61ca-42a3-8e73-2c939c504113", name: "Madagascar", code: "MG" },
  { id: "a4897664-a72b-46d6-937c-6a2c3957aded", name: "Malawi", code: "MW" },
  { id: "1346fbb8-6813-4782-8349-184ae3fae340", name: "Mali", code: "ML" },
  { id: "5e2a4df7-8861-418a-b408-b461eb844812", name: "Mauritania", code: "MR" },
  { id: "e4b56224-33b8-45dd-8e8a-1107c6e18e1f", name: "Mauritius", code: "MU" },
  { id: "284f802d-61fd-4eb3-ac4b-ca4b07c18d50", name: "Morocco", code: "MA" },
  { id: "5295ddc9-f2f8-4eea-b48a-d0733e50cdf8", name: "Mozambique", code: "MZ" },
  { id: "74afaf87-0667-43d3-83fd-8134214729df", name: "Namibia", code: "NA" },
  { id: "9ae4089d-b966-42f4-bc5c-4df6a1eeae39", name: "Niger", code: "NE" },
  { id: "b7da12cf-4205-4a57-8801-1478c666929e", name: "Nigeria", code: "NG" },
  { id: "ddf7999b-b2e6-4009-8c21-9499bf97142f", name: "Republic of Congo", code: "CG" },
  { id: "441b429b-7857-4c96-a457-8eb3cab13e99", name: "Rwanda", code: "RW" },
  { id: "ed58ed48-3f36-41c2-96f5-9a055bd8ecbf", name: "Sao Tome and Principe", code: "ST" },
  { id: "005c0811-fbdb-417d-b24d-ec7b0c46108c", name: "Senegal", code: "SN" },
  { id: "4586f2a3-c8cc-476c-ac85-ea779a3332e2", name: "Seychelles", code: "SC" },
  { id: "5db4af96-c38a-49bb-8175-cf5ae6cf48c4", name: "Sierra Leone", code: "SL" },
  { id: "73bcf603-ea5d-4400-93c5-9d9aef0023cb", name: "Somalia", code: "SO" },
  { id: "3339da08-8031-43d8-baa0-3d65ac1f0a50", name: "South Africa", code: "ZA" },
  { id: "1548ae9d-6998-4e12-a10b-667b881321c5", name: "South Sudan", code: "SS" },
  { id: "8b47f70e-c6ea-46c2-a980-cba2964aefc0", name: "Sudan", code: "SD" },
  { id: "b02408f3-74f1-4565-8bb8-20ab590d03c7", name: "Tanzania", code: "TZ" },
  { id: "be3d3871-ccfa-481d-b88a-ed0352176ed2", name: "Togo", code: "TG" },
  { id: "fc90e5d6-e6bc-4347-9372-eaa00b115e8b", name: "Tunisia", code: "TN" },
  { id: "9dde3942-1c89-4bfa-bca8-dc3cd3cfb19b", name: "Uganda", code: "UG" },
  { id: "f4ae2c19-d01c-4dfd-8ed5-a8629e8608ed", name: "Zambia", code: "ZM" },
  { id: "3d640337-0ab2-4cb6-a2f0-0ab9e6f8c15a", name: "Zimbabwe", code: "ZW" }
];

// Helper function to get country by ID
export function getCountryById(id: string): AfricanCountry | undefined {
  return AFRICAN_COUNTRIES.find(country => country.id === id);
}

// Helper function to get country by code
export function getCountryByCode(code: string): AfricanCountry | undefined {
  return AFRICAN_COUNTRIES.find(country => country.code === code);
}

// Helper function to get country by name
export function getCountryByName(name: string): AfricanCountry | undefined {
  return AFRICAN_COUNTRIES.find(country => country.name === name);
}
