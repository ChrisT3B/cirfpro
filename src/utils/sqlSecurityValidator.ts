// src/utils/sqlSecurityValidator.ts - CIRFPRO specific
export class SQLSecurityValidator {
  /**
   * Validate UUID format for database queries
   */
  static validateUUID(uuid: string): { isValid: boolean; clean?: string; error?: string } {
    if (!uuid || typeof uuid !== 'string') {
      return { isValid: false, error: 'UUID is required' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return { isValid: false, error: 'Invalid UUID format' };
    }

    return { isValid: true, clean: uuid.toLowerCase() };
  }

  /**
   * Validate email format and check for SQL injection patterns
   */
  static validateEmailForDB(email: string): { isValid: boolean; clean?: string; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanEmail = email.toLowerCase().trim();

    if (!emailRegex.test(cleanEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Check for SQL injection patterns
    if (this.containsSQLInjection(cleanEmail)) {
      return { isValid: false, error: 'Invalid characters in email' };
    }

    return { isValid: true, clean: cleanEmail };
  }

  /**
   * Check for SQL injection patterns in input
   */
  static containsSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    const sqlPatterns = [
      // Basic SQL keywords
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
      // Boolean-based injection
      /\b(OR|AND)\s*['"]*\s*\d+\s*['"]*\s*=\s*['"]*\s*\d+\s*['"]*\b/i,
      // Union-based injection
      /UNION\s+(ALL\s+)?SELECT/i,
      // Comment patterns
      /\/\*[\s\S]*?\*\//,
      /--[^\r\n]*/,
      /#[^\r\n]*/,
      // String manipulation
      /\b(CONCAT|SUBSTRING|ASCII|CHAR)\s*\(/i,
      // Database functions
      /\b(USER|DATABASE|VERSION|@@)\b/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate role enum value
   */
  static validateRole(role: string): { isValid: boolean; clean?: string; error?: string } {
    if (!role || typeof role !== 'string') {
      return { isValid: false, error: 'Role is required' };
    }

    const validRoles = ['coach', 'athlete'];
    const cleanRole = role.toLowerCase().trim();

    if (!validRoles.includes(cleanRole)) {
      return { isValid: false, error: 'Invalid role. Must be coach or athlete' };
    }

    return { isValid: true, clean: cleanRole };
  }

  /**
   * Validate experience level enum value
   */
  static validateExperienceLevel(level: string): { isValid: boolean; clean?: string; error?: string } {
    if (!level || typeof level !== 'string') {
      return { isValid: false, error: 'Experience level is required' };
    }

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    const cleanLevel = level.toLowerCase().trim();

    if (!validLevels.includes(cleanLevel)) {
      return { isValid: false, error: 'Invalid experience level' };
    }

    return { isValid: true, clean: cleanLevel };
  }

  /**
   * General string validation for database insertion
   */
  static validateStringForDB(input: string, maxLength: number = 255): { isValid: boolean; clean?: string; error?: string } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, error: 'Input is required' };
    }

    if (input.length > maxLength) {
      return { isValid: false, error: `Input too long (max ${maxLength} characters)` };
    }

    if (this.containsSQLInjection(input)) {
      return { isValid: false, error: 'Invalid characters detected' };
    }

    return { isValid: true, clean: input.trim() };
  }
}