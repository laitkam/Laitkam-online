export interface Job {
  id: string;
  title: string;
  qualificationRequired: string;
  ageMin?: number;
  ageMax?: number;
  genderPreference?: 'Male' | 'Female' | 'Other' | 'Any';
  applyLink: string;
  createdAt: string;
  expirationDate?: string;
  attachmentUrl?: string;
  salary?: string;
  experience?: string;
  shareCount?: number;
  numberOfPosts?: number;
}

export type QualificationOption = 
  | 'VI' 
  | 'VII' 
  | 'VIII' 
  | 'IX' 
  | '10th' 
  | '11th'
  | '12th' 
  | 'Diploma'
  | 'Graduate' 
  | 'Post Graduate'
  | 'M.Phil' 
  | 'PhD';

export type GenderOption = 'Male' | 'Female' | 'Other';

export interface JobFilter {
  gender?: GenderOption;
  age?: number;
  qualification?: QualificationOption;
}