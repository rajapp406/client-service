/**
 * User Profile Module Usage Examples
 * 
 * This file demonstrates how to use the UserProfileService in other parts of the application.
 * These are example implementations and should not be used directly in production.
 */

import { Injectable } from '@nestjs/common';
import { UserProfileService } from '../user-profile.service';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { OnboardingUserProfileDto } from '../dto/onboarding-user-profile.dto';
import { UserType, Board } from '../../../../generated/prisma';

@Injectable()
export class UserProfileUsageExamples {
  constructor(private readonly userProfileService: UserProfileService) {}

  /**
   * Example: Create a basic user profile
   */
  async createBasicProfileExample(): Promise<void> {
    const newProfile: CreateUserProfileDto = {
      userId: 'user123',
      userType: UserType.STUDENT,
      locationId: 'location-uuid',
      schoolId: 'school-uuid',
      grade: 10,
      board: Board.CBSE,
      phoneNumber: '+1234567890',
      parentEmail: 'parent@example.com',
    };

    try {
      const createdProfile = await this.userProfileService.create(newProfile);
      console.log('Profile created:', createdProfile);
    } catch (error) {
      console.error('Failed to create profile:', error.message);
    }
  }

  /**
   * Example: Onboarding process with interests
   */
  async onboardingProcessExample(): Promise<void> {
    const onboardingData: OnboardingUserProfileDto = {
      userId: 'newuser456',
      userType: UserType.STUDENT,
      schoolId: 'school-uuid',
      grade: 11,
      board: Board.ICSE,
      dateOfBirth: '2005-06-15T00:00:00.000Z',
      interests: ['Mathematics', 'Physics', 'Computer Science', 'Sports'],
    };

    try {
      const profile = await this.userProfileService.onboarding(onboardingData);
      console.log('Onboarding completed:', {
        profile: profile.id,
        interests: profile.interests?.length || 0,
      });
    } catch (error) {
      console.error('Onboarding failed:', error.message);
    }
  }

  /**
   * Example: Search for student profiles
   */
  async searchStudentProfilesExample(): Promise<void> {
    try {
      // Search for CBSE students in grade 10
      const cbseStudents = await this.userProfileService.searchProfiles({
        userType: UserType.STUDENT,
        grade: 10,
        board: Board.CBSE,
      });
      console.log('CBSE Grade 10 students:', cbseStudents.length);

      // Search by school
      const schoolStudents = await this.userProfileService.searchProfiles({
        schoolId: 'specific-school-uuid',
        userType: UserType.STUDENT,
      });
      console.log('Students in specific school:', schoolStudents.length);

      // Text search
      const searchResults = await this.userProfileService.searchProfiles({
        search: 'john@example.com',
      });
      console.log('Search results:', searchResults.length);
    } catch (error) {
      console.error('Search failed:', error.message);
    }
  }

  /**
   * Example: Get user profile with all relations
   */
  async getCompleteProfileExample(userId: string): Promise<void> {
    try {
      const profile = await this.userProfileService.findByUserId(userId, true);
      console.log('Complete profile:', {
        user: profile.userId,
        school: profile.school?.name,
        location: `${profile.location?.city?.name}, ${profile.location?.city?.State?.name}`,
        interests: profile.interests?.map(i => i.interest),
      });
    } catch (error) {
      console.error('Failed to get profile:', error.message);
    }
  }

  /**
   * Example: Update user profile
   */
  async updateProfileExample(userId: string): Promise<void> {
    try {
      const updatedProfile = await this.userProfileService.updateByUserId(userId, {
        grade: 12,
        board: Board.IB,
        phoneNumber: '+1987654321',
      });
      console.log('Profile updated:', updatedProfile.id);
    } catch (error) {
      console.error('Failed to update profile:', error.message);
    }
  }

  /**
   * Example: Manage user interests
   */
  async manageInterestsExample(profileId: string): Promise<void> {
    try {
      // Add interests
      await this.userProfileService.addInterest(profileId, 'Artificial Intelligence');
      await this.userProfileService.addInterest(profileId, 'Machine Learning');
      console.log('Interests added successfully');

      // Remove interest
      await this.userProfileService.removeInterest(profileId, 'Sports');
      console.log('Interest removed successfully');
    } catch (error) {
      console.error('Interest management failed:', error.message);
    }
  }

  /**
   * Example: Get profile statistics
   */
  async getStatisticsExample(): Promise<void> {
    try {
      const stats = await this.userProfileService.getProfileStatistics();
      console.log('Profile Statistics:', {
        total: stats.totalProfiles,
        students: stats.profilesByType[UserType.STUDENT] || 0,
        teachers: stats.profilesByType[UserType.TEACHER] || 0,
        grade10: stats.profilesByGrade[10] || 0,
        grade11: stats.profilesByGrade[11] || 0,
        grade12: stats.profilesByGrade[12] || 0,
      });
    } catch (error) {
      console.error('Failed to get statistics:', error.message);
    }
  }

  /**
   * Example: Bulk profile operations
   */
  async bulkOperationsExample(): Promise<void> {
    const profilesData: CreateUserProfileDto[] = [
      {
        userId: 'student1',
        userType: UserType.STUDENT,
        locationId: 'location-uuid',
        grade: 10,
        board: Board.CBSE,
      },
      {
        userId: 'student2',
        userType: UserType.STUDENT,
        locationId: 'location-uuid',
        grade: 11,
        board: Board.ICSE,
      },
      {
        userId: 'teacher1',
        userType: UserType.TEACHER,
        locationId: 'location-uuid',
        schoolId: 'school-uuid',
      },
    ];

    const results = [];
    const errors = [];

    for (const profileData of profilesData) {
      try {
        const profile = await this.userProfileService.create(profileData);
        results.push(profile);
      } catch (error) {
        errors.push({
          profileData,
          error: error.message,
        });
      }
    }

    console.log('Bulk operations results:', {
      successful: results.length,
      failed: errors.length,
      results: results.map(r => ({ id: r.id, userId: r.userId })),
      errors,
    });
  }

  /**
   * Example: Teacher profile management
   */
  async teacherProfileExample(): Promise<void> {
    const teacherProfile: CreateUserProfileDto = {
      userId: 'teacher123',
      userType: UserType.TEACHER,
      locationId: 'location-uuid',
      schoolId: 'school-uuid',
      phoneNumber: '+1234567890',
      parentEmail: 'teacher@school.edu', // Using as contact email
    };

    try {
      const profile = await this.userProfileService.create(teacherProfile);
      console.log('Teacher profile created:', profile.id);

      // Add professional interests
      await this.userProfileService.addInterest(profile.id, 'Mathematics Education');
      await this.userProfileService.addInterest(profile.id, 'Curriculum Development');
      await this.userProfileService.addInterest(profile.id, 'Student Assessment');

      console.log('Teacher interests added');
    } catch (error) {
      console.error('Teacher profile creation failed:', error.message);
    }
  }

  /**
   * Example: Parent profile management
   */
  async parentProfileExample(): Promise<void> {
    const parentProfile: CreateUserProfileDto = {
      userId: 'parent123',
      userType: UserType.PARENT,
      locationId: 'location-uuid',
      phoneNumber: '+1234567890',
      parentEmail: 'parent@example.com', // Using as primary email
    };

    try {
      const profile = await this.userProfileService.create(parentProfile);
      console.log('Parent profile created:', profile.id);

      // Add parental interests
      await this.userProfileService.addInterest(profile.id, 'Child Education');
      await this.userProfileService.addInterest(profile.id, 'School Activities');
      await this.userProfileService.addInterest(profile.id, 'Academic Progress');

      console.log('Parent interests added');
    } catch (error) {
      console.error('Parent profile creation failed:', error.message);
    }
  }
}