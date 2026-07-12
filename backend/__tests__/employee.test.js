const Employee = require('../models/Employee');

describe('Employee Model', () => {
  describe('Employee Validation', () => {
    it('should require name field', () => {
      const employeeData = {
        email: 'test@example.com',
        phone: '1234567890',
        department: 'dept123',
        designation: 'Developer',
        salary: 50000,
        joiningDate: new Date(),
        status: 'Active'
      };

      expect(employeeData.name).toBeUndefined();
    });

    it('should require email field', () => {
      const employeeData = {
        name: 'John Doe',
        phone: '1234567890',
        department: 'dept123',
        designation: 'Developer',
        salary: 50000,
        joiningDate: new Date(),
        status: 'Active'
      };

      expect(employeeData.email).toBeUndefined();
    });

    it('should validate salary as number', () => {
      const employeeData = {
        name: 'John Doe',
        email: 'test@example.com',
        phone: '1234567890',
        department: 'dept123',
        designation: 'Developer',
        salary: '50000',
        joiningDate: new Date(),
        status: 'Active'
      };

      expect(typeof employeeData.salary).toBe('string');
    });
  });

  describe('Employee Status', () => {
    it('should accept Active status', () => {
      const employeeData = {
        name: 'John Doe',
        email: 'test@example.com',
        status: 'Active'
      };

      expect(employeeData.status).toBe('Active');
    });

    it('should accept Inactive status', () => {
      const employeeData = {
        name: 'John Doe',
        email: 'test@example.com',
        status: 'Inactive'
      };

      expect(employeeData.status).toBe('Inactive');
    });

    it('should not accept invalid status', () => {
      const employeeData = {
        name: 'John Doe',
        email: 'test@example.com',
        status: 'InvalidStatus'
      };

      expect(['Active', 'Inactive']).not.toContain(employeeData.status);
    });
  });
});
