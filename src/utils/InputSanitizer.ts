// src/utils/inputSanitizer.ts - CIRFPRO specific
export class InputSanitizer {
  /**
   * Sanitize email addresses - remove dangerous characters but preserve valid email format
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    
    return email
      .toLowerCase()
      .trim()
      .replace(/[<>'"]/g, '') // Remove XSS-prone characters
      .replace(/\s/g, ''); // Remove all whitespace
  }

  /**
   * Sanitize names - allow letters, spaces, hyphens, apostrophes
   */
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    return name
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s'-]/g, '') // Keep only word chars, spaces, hyphens, apostrophes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 100); // Limit length
  }

  /**
   * Sanitize array fields (like qualifications, specializations)
   */
  static sanitizeStringArray(arr: string[]): string[] {
    if (!Array.isArray(arr)) return [];
    
    return arr
      .map(item => this.sanitizeName(item))
      .filter(item => item.length > 0)
      .slice(0, 10); // Limit array size
  }

  /**
   * Comprehensive form data sanitization for CIRFPRO registration
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value === null || value === undefined) {
        sanitized[key] = value;
        return;
      }

      switch (key.toLowerCase()) {
        case 'email':
          sanitized[key] = this.sanitizeEmail(value);
          break;
        case 'firstname':
        case 'first_name':
        case 'lastname':
        case 'last_name':
          sanitized[key] = this.sanitizeName(value);
          break;
        case 'qualifications':
        case 'specializations':
          sanitized[key] = Array.isArray(value) ? this.sanitizeStringArray(value) : [];
          break;
        case 'role':
        case 'experience_level':
          // These are enums, just ensure they're strings and trim
          sanitized[key] = typeof value === 'string' ? value.trim() : value;
          break;
        case 'date_of_birth':
          // Date should remain as-is if it's already validated
          sanitized[key] = value;
          break;
        default:
          // For any other string fields, apply basic name sanitization
          if (typeof value === 'string') {
            sanitized[key] = this.sanitizeName(value);
          } else {
            sanitized[key] = value;
          }
      }
    });

    return sanitized;
  }
}