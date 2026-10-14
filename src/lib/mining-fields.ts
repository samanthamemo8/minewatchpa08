export type FieldId = 'pa' | 'wv' | 'co';
export type Profile = {
  zip: string; place: string; score: number; rainImpact: number; depth: number | null;
  depthNote: string; vein: string; soil: string; insurance: string; worst: string;
  trend: number[]; protocol: string[];
};
export type MiningField = {
  id: FieldId; name: string; region: string; state: string; district: string;
  agency: string; funding: string; hotline: string; telephone: string;
  resourceTitle: string; resourceUrl: string; protectionUrl?: string; program: string; geology: string;
  profiles: Profile[]; samples: string[];
};
const guidance = (score: number, agency: string) => [
  score > 70 ? 'Keep people away from cracks, depressions, and open shafts; call 911 for immediate danger.' : score >= 40 ? 'Document changes and request a professional assessment before excavation or renovation.' : 'Keep baseline property records and monitor for new movement after storms.',
  `Contact ${agency} for mine mapping and hazard review. Public reclamation assistance is site-dependent, not an automatic homeowner benefit.`,
];
const local = (zip: string, place: string, score: number, rainImpact: number, depth: number | null, vein: string, soil: string, trend: number[], agency: string): Profile => ({
  zip, place, score, rainImpact, depth, vein, soil, trend, depthNote: depth === null ? 'Depth not mapped — survey required' : 'Pilot historical workings model',
  insurance: 'Agency review required', worst: depth === null ? 'Unmapped vertical shafts' : score > 70 ? 'Shallow workings + ground movement' : score < 40 ? 'Low modeled movement' : 'Ground movement monitoring', protocol: guidance(score, agency),
});
export const miningFields: Record<FieldId, MiningField> = {
  pa: {
    id: 'pa', name: 'Appalachian Anthracite Field', region: 'Northeastern PA', state: 'Pennsylvania', district: 'PA-08', agency: 'PA DEP', geology: 'anthracite',
    funding: 'PA Regional Allocation: $3.8 Billion available via the Bipartisan Infrastructure Law (BIL) for high-priority hazard mitigation.',
    hotline: 'Call PA DEP MSI Hotline (1-800-288-7647)', telephone: '18002887647',
    resourceTitle: 'Apply for PA DEP MSI', resourceUrl: 'https://www.pa.gov/agencies/dep/programs-and-services/mining/abandoned-mine-reclamation/mine-subsidence-insurance.html',
    program: 'PA Mine Subsidence Insurance covers eligible structures, subject to PA DEP determination. Apply before damage occurs; this pilot score does not establish coverage.',
    samples: ['600 block of N Washington Ave, Scranton, PA', '200 block of Carey Ave, Wilkes-Barre, PA'],
    profiles: [
      { ...local('18702', 'Wilkes-Barre Center', 82, 16, 95, 'Baltimore Vein', 'Shifting', [2.1,5.8,2.7,6.2,3.1,5.6,2.4,6,3.3,6.1,2.9,6.2], 'PA DEP'), insurance: 'Critical', protocol: ['Document cracks and depressions now; avoid altering the affected area.', 'Contact the MSI office for priority eligibility review and submit an online application.'] },
      { ...local('18503', 'Scranton Downtown', 58, 9, 210, 'Dunmore Vein #3', 'Active Monitoring', [1.6,2.1,2.6,2.2,1.8,2.3,2.9,2.5,2.1,2.6,3.2,2.7], 'PA DEP'), insurance: 'Recommended', protocol: ['Request the Lackawanna County mine map review before renovations.', 'Apply for MSI coverage while the property remains free of active subsidence damage.'] },
      { ...local('18706', 'Hanover Township', 34, 2, 480, 'Deep Layers', 'Stable', [.9,1,.8,1.1,1,1.2,1.1,1,1.2,1.3,1.2,1.1], 'PA DEP'), insurance: 'Optional', protocol: ['Retain this baseline assessment with your property records.', 'Review optional MSI coverage for long-term protection.'] },
    ],
  },
  wv: {
    id: 'wv', name: 'Central Bituminous Belt', region: 'West Virginia', state: 'West Virginia', district: 'WV-02', agency: 'WV DEP AML', geology: 'bituminous coal',
    funding: 'WV Regional Allocation: $2.1 Billion allocated for acid mine drainage and regional subsidence buffering.',
    hotline: 'Call WV DEP AML Office (304-926-0499)', telephone: '3049260499',
    resourceTitle: 'WV DEP Abandoned Mine Lands', resourceUrl: 'https://dep.wv.gov/dlr/aml/Pages/default.aspx',
    protectionUrl: 'https://brim.wv.gov/claim/Pages/Mine-Subsidence.aspx',
    program: 'WV DEP AML reviews mine hazards. For mine subsidence insurance, contact your insurer and WV BRIM about existing policy coverage, exclusions, and claims; a pilot risk score does not establish eligibility. The listed WV number is DEP headquarters; request the AML office.',
    samples: ['100 block of High Street, Morgantown, WV', '200 block of Fairmont Avenue, Fairmont, WV'],
    profiles: [
      local('morgantown', 'Morgantown Commercial Core', 76, 11, 180, 'Bituminous Workings', 'Active Monitoring', [2.2,3.6,2.8,4.9,3.1,5.2,3.4,4.7,3.6,5.3,4,5.1], 'WV DEP AML'),
      local('monongalia', 'Monongalia County Housing', 51, 6, 310, 'Deep Bituminous Layers', 'Stable', [1.2,1.7,2.1,1.8,1.5,2,2.4,2,1.7,2.1,2.5,2.2], 'WV DEP AML'),
      local('fairmont', 'Fairmont Rural Slopes', 89, 18, 65, 'Shallow Voids', 'Critical Displacement', [2.7,6.1,3.2,5.8,3.4,6,3.1,6.1,3.6,6,3.8,6.1], 'WV DEP AML'),
    ],
  },
  co: {
    id: 'co', name: 'Western Rocky Mountain Zone', region: 'Colorado', state: 'Colorado', district: 'CO-03', agency: 'CO DRMS', geology: 'hardrock',
    funding: 'CO Regional Allocation: $89 Million targeted at high-altitude abandoned hardrock shaft closures.',
    hotline: 'Call CO DRMS Reclamation Bureau (303-866-3567)', telephone: '3038663567',
    resourceTitle: 'CO Inactive Mine Reclamation', resourceUrl: 'https://drms.colorado.gov/programs/inactive-mine-reclamation-program',
    protectionUrl: 'https://drms.colorado.gov/programs/inactive-mine-reclamation-program/mine-subsidence-protection-program',
    program: 'CO DRMS reviews inactive mine hazards and shaft closures. Its Mine Subsidence Protection Program concerns eligible coal-mine damage, not automatic coverage for the hardrock areas modeled here. Ask DRMS for site-specific program eligibility. The listed number is DRMS general assistance.',
    samples: ['100 block of Harrison Avenue, Leadville, CO', '200 block of Pearl Street, Boulder, CO'],
    profiles: [
      local('leadville', 'Leadville Historic District', 81, 14, null, 'Unmapped Vertical Shafts', 'Fractured', [2.5,4.8,3.1,5.4,3.5,5.8,3.2,5.1,3.9,5.7,4.1,5.5], 'CO DRMS'),
      local('teller', 'Teller County Gold Veins', 24, 0, 600, 'Deep Granite', 'Solid', [.5,.6,.5,.7,.6,.7,.6,.5,.7,.8,.6,.7], 'CO DRMS'),
      local('boulder', 'Boulder Foothills Residential', 45, 5, 290, 'Hardrock Layers', 'Stable', [1,1.5,1.9,1.6,1.3,1.8,2.1,1.7,1.4,1.9,2.2,1.8], 'CO DRMS'),
    ],
  },
};
