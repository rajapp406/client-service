/**
 * School Module Usage Examples
 * 
 * This file demonstrates how to use the SchoolService in other parts of the application.
 * These are example implementations and should not be used directly in production.
 */

import { Injectable } from '@nestjs/common';
import { SchoolService } from '../school.service';
import { CreateSchoolDto } from '../dto/create-school.dto';

@Injectable()
export class SchoolUsageExamples {
  constructor(private readonly schoolService: SchoolService) {}

  /**
   * Example: Create a new school
   */
  async createSchoolExample(): Promise<void> {
    const newSchool: CreateSchoolDto = {
      name: 'Example High School',
    };

    try {
      const createdSchool = await this.schoolService.create(newSchool);
      console.log('School created:', createdSchool);
    } catch (error) {
      console.error('Failed to create school:', error.message);
    }
  }

  /**
   * Example: Search for schools
   */
  async searchSchoolsExample(): Promise<void> {
    try {
      // Search by name
      const schoolsByName = await this.schoolService.searchSchools({
        search: 'High School',
      });
      console.log('Schools found by name:', schoolsByName);

      // Search by cityId via branches
      const schoolsByCity = await this.schoolService.searchSchools({
        cityId: '123e4567-e89b-12d3-a456-426614174000',
      });
      console.log('Schools found by city:', schoolsByCity);

      // Combined search
      const combinedSearch = await this.schoolService.searchSchools({
        search: 'Public',
        cityId: '123e4567-e89b-12d3-a456-426614174000',
      });
      console.log('Combined search results:', combinedSearch);
    } catch (error) {
      console.error('Search failed:', error.message);
    }
  }

  /**
   * Example: Get school with leaderboard
   */
  async getSchoolWithLeaderboardExample(schoolId: string): Promise<void> {
    try {
      const schoolWithLeaderboard = await this.schoolService.getSchoolWithLeaderboard(schoolId);
      console.log('School with leaderboard:', {
        school: {
          id: schoolWithLeaderboard.id,
          name: schoolWithLeaderboard.name,
        },
        topStudents: schoolWithLeaderboard.Leaderboard.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to get school with leaderboard:', error.message);
    }
  }

  /**
   * Example: Update school information
   */
  async updateSchoolExample(schoolId: string): Promise<void> {
    try {
      const updatedSchool = await this.schoolService.update(schoolId, {
        name: 'Updated School Name',
      });
      console.log('School updated:', updatedSchool);
    } catch (error) {
      console.error('Failed to update school:', error.message);
    }
  }

  /**
   * Example: Get all schools with pagination
   */
  async getAllSchoolsWithPaginationExample(): Promise<void> {
    try {
      const schools = await this.schoolService.findAll({
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      console.log('Paginated schools:', schools);
    } catch (error) {
      console.error('Failed to get schools:', error.message);
    }
  }

  /**
   * Example: Bulk operations (custom implementation)
   */
  async bulkCreateSchoolsExample(schoolsData: CreateSchoolDto[]): Promise<void> {
    const results = [];
    const errors = [];

    for (const schoolData of schoolsData) {
      try {
        const school = await this.schoolService.create(schoolData);
        results.push(school);
      } catch (error) {
        errors.push({
          schoolData,
          error: error.message,
        });
      }
    }

    console.log('Bulk create results:', {
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  }
}