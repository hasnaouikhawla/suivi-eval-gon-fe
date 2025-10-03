import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rapport, CreateRapportRequest, RapportStats } from '../models/rapport.model';
import { environment } from '../environment';

export interface RapportFilters {
  type_rapport?: string;
  periode?: string;
  created_by?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface ReportGenerationRequest {
  periode: string;
}

export interface ReportPreviewRequest {
  type_rapport: string;
  periode: string;
}

export interface ReportType {
  value: string;
  label: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private baseUrl = `${environment.apiBaseUrl}/rapports`;

  // Predefined report types (must match backend)
  private readonly reportTypes: ReportType[] = [
    { value: 'mensuel', label: 'Rapport Mensuel' },
    { value: 'trimestriel', label: 'Rapport Trimestriel' },
    { value: 'semestriel', label: 'Rapport Semestriel' },
    { value: 'annuel', label: 'Rapport Annuel' },
    { value: 'activite', label: 'Rapport d\'Activité' },
    { value: 'financier', label: 'Rapport Financier' },
    { value: 'indicateurs', label: 'Rapport des Indicateurs' },
    { value: 'synthese', label: 'Rapport de Synthèse' }
  ];

  // Period options for different report types
  private readonly periodOptions = {
    mensuel: this.generateMonthlyPeriods(),
    trimestriel: this.generateQuarterlyPeriods(),
    semestriel: this.generateSemesterPeriods(),
    annuel: this.generateYearlyPeriods(),
    activite: this.generateAllPeriods(),
    financier: this.generateQuarterlyPeriods(),
    indicateurs: this.generateMonthlyPeriods(),
    synthese: this.generateYearlyPeriods()
  };

  constructor(private http: HttpClient) {}

  getAll(filters?: RapportFilters): Observable<ApiResponse<Rapport[]>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<Rapport[]>>(`${this.baseUrl}`, { params });
  }

  getById(id: number): Observable<ApiResponse<Rapport>> {
    return this.http.get<ApiResponse<Rapport>>(`${this.baseUrl}/${id}`);
  }

  getStats(filters?: RapportFilters): Observable<ApiResponse<RapportStats>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<RapportStats>>(`${this.baseUrl}/stats`, { params });
  }

  getReportTypes(): Observable<ApiResponse<ReportType[]>> {
    return this.http.get<ApiResponse<ReportType[]>>(`${this.baseUrl}/types`);
  }

  // Generate specific content-based reports
  generateActivityReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/activity`, request);
  }

  generateFinancialReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/financial`, request);
  }

  generateIndicatorsReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/indicators`, request);
  }

  generateSynthesisReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/synthesis`, request);
  }

  // Generate periodic reports (NEW endpoints)
  generateMonthlyReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/monthly`, request);
  }

  generateQuarterlyReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/quarterly`, request);
  }

  generateSemiAnnualReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/semiannual`, request);
  }

  generateAnnualReport(request: ReportGenerationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/annual`, request);
  }

  // Preview report data before generation
  previewReport(request: ReportPreviewRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/preview`, request);
  }

  // Update report
  update(id: number, reportData: Partial<CreateRapportRequest>): Observable<ApiResponse<Rapport>> {
    return this.http.put<ApiResponse<Rapport>>(`${this.baseUrl}/${id}`, reportData);
  }

  // Delete report
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // Download report in different formats
  download(id: number, format: string = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Frontend-only methods for getting predefined options
  getReportTypesLocal(): ReportType[] {
    return [...this.reportTypes];
  }

  getPeriodOptions(reportType: string): string[] {
    return this.periodOptions[reportType as keyof typeof this.periodOptions] || this.generateAllPeriods();
  }

  // Helper methods for display names
  getReportTypeDisplayName(reportType: string): string {
    const type = this.reportTypes.find(t => t.value === reportType);
    return type ? type.label : reportType;
  }

  getFormatDisplayName(format: string): string {
    const formats: Record<string, string> = {
      'pdf': 'PDF',
      'excel': 'Excel',
      'csv': 'CSV'
    };
    return formats[format] || format.toUpperCase();
  }

  // Universal report generation method - routes to correct endpoint
  generateReport(reportType: string, periode: string): Observable<ApiResponse<any>> {
    const request: ReportGenerationRequest = { periode };
    
    switch (reportType) {
      // Content-based reports
      case 'activite':
        return this.generateActivityReport(request);
      case 'financier':
        return this.generateFinancialReport(request);
      case 'indicateurs':
        return this.generateIndicatorsReport(request);
      case 'synthese':
        return this.generateSynthesisReport(request);
      
      // Period-based reports
      case 'mensuel':
        return this.generateMonthlyReport(request);
      case 'trimestriel':
        return this.generateQuarterlyReport(request);
      case 'semestriel':
        return this.generateSemiAnnualReport(request);
      case 'annuel':
        return this.generateAnnualReport(request);
        
      default:
        throw new Error(`Type de rapport non supporté: ${reportType}`);
    }
  }

  // Utility methods for period generation
  private generateMonthlyPeriods(): string[] {
    const periods: string[] = [];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    
    years.forEach(year => {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        periods.push(`${year}-${monthStr}`);
      }
    });
    
    return periods.reverse(); // Most recent first
  }

  private generateQuarterlyPeriods(): string[] {
    const periods: string[] = [];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    
    years.forEach(year => {
      for (let quarter = 1; quarter <= 4; quarter++) {
        periods.push(`${year}-Q${quarter}`);
      }
    });
    
    return periods.reverse(); // Most recent first
  }

  private generateSemesterPeriods(): string[] {
    const periods: string[] = [];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    
    years.forEach(year => {
      periods.push(`${year}-S1`);
      periods.push(`${year}-S2`);
    });
    
    return periods.reverse(); // Most recent first
  }

  private generateYearlyPeriods(): string[] {
    const periods: string[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
      periods.push(year.toString());
    }
    
    return periods;
  }

  // Generate all possible period formats for flexible reports
  private generateAllPeriods(): string[] {
    const monthly = this.generateMonthlyPeriods();
    const quarterly = this.generateQuarterlyPeriods();
    const semesters = this.generateSemesterPeriods();
    const yearly = this.generateYearlyPeriods();
    
    // Combine and sort by most recent first
    return [...yearly, ...semesters, ...quarterly, ...monthly];
  }

  // Validation helpers
  validatePeriod(period: string, reportType: string): { valid: boolean; error?: string } {
    if (!period) {
      return { valid: false, error: 'Période requise' };
    }

    // Validate format based on report type
    switch (reportType) {
      case 'mensuel':
        if (!period.match(/^\d{4}-\d{2}$/)) {
          return { valid: false, error: 'Format mensuel requis (YYYY-MM)' };
        }
        break;
      case 'trimestriel':
        if (!period.match(/^\d{4}-Q[1-4]$/)) {
          return { valid: false, error: 'Format trimestriel requis (YYYY-Q1/Q2/Q3/Q4)' };
        }
        break;
      case 'semestriel':
        if (!period.match(/^\d{4}-S[1-2]$/)) {
          return { valid: false, error: 'Format semestriel requis (YYYY-S1/S2)' };
        }
        break;
      case 'annuel':
        if (!period.match(/^\d{4}$/)) {
          return { valid: false, error: 'Format annuel requis (YYYY)' };
        }
        break;
      default:
        // For content-based reports, accept any valid format
        if (!period.match(/^\d{4}$/) && !period.match(/^\d{4}-\d{2}$/) && 
            !period.match(/^\d{4}-Q[1-4]$/) && !period.match(/^\d{4}-S[1-2]$/)) {
          return { valid: false, error: 'Format de période invalide' };
        }
    }

    // Validate year range
    const year = parseInt(period.substring(0, 4));
    const currentYear = new Date().getFullYear();
    if (year < currentYear - 10 || year > currentYear + 5) {
      return { valid: false, error: 'Année hors de la plage valide' };
    }

    return { valid: true };
  }

  // Format period for display
  formatPeriodForDisplay(period: string): string {
    if (period.match(/^\d{4}$/)) {
      return `Année ${period}`;
    } else if (period.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = period.split('-');
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } else if (period.match(/^\d{4}-Q[1-4]$/)) {
      const [year, quarter] = period.split('-');
      const quarterNames = { 'Q1': '1er trimestre', 'Q2': '2ème trimestre', 'Q3': '3ème trimestre', 'Q4': '4ème trimestre' };
      return `${quarterNames[quarter as keyof typeof quarterNames]} ${year}`;
    } else if (period.match(/^\d{4}-S[1-2]$/)) {
      const [year, semester] = period.split('-');
      const semesterNames = { 'S1': '1er semestre', 'S2': '2ème semestre' };
      return `${semesterNames[semester as keyof typeof semesterNames]} ${year}`;
    }
    
    return period;
  }

  // Get recommended period format for report type
  getRecommendedPeriodFormat(reportType: string): string {
    const formats: Record<string, string> = {
      'mensuel': 'YYYY-MM (ex: 2025-09)',
      'trimestriel': 'YYYY-Q1/Q2/Q3/Q4 (ex: 2025-Q3)',
      'semestriel': 'YYYY-S1/S2 (ex: 2025-S2)',
      'annuel': 'YYYY (ex: 2025)',
      'activite': 'YYYY, YYYY-MM, YYYY-Q1, etc.',
      'financier': 'YYYY-Q1/Q2/Q3/Q4 (ex: 2025-Q3)',
      'indicateurs': 'YYYY-MM (ex: 2025-09)',
      'synthese': 'YYYY (ex: 2025)'
    };
    return formats[reportType] || 'Format flexible accepté';
  }

  // Get current period suggestion based on report type
  getCurrentPeriodSuggestion(reportType: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const semester = now.getMonth() < 6 ? 1 : 2;

    switch (reportType) {
      case 'mensuel':
        return `${year}-${month}`;
      case 'trimestriel':
        return `${year}-Q${quarter}`;
      case 'semestriel':
        return `${year}-S${semester}`;
      case 'annuel':
        return year.toString();
      default:
        return `${year}-${month}`; // Default to current month
    }
  }

  // Check if report type supports multiple period formats
  supportsMultiplePeriodFormats(reportType: string): boolean {
    const flexibleTypes = ['activite', 'synthese'];
    return flexibleTypes.includes(reportType);
  }

  // Get period suggestions for autocomplete
  getPeriodSuggestions(reportType: string, query: string = ''): string[] {
    const options = this.getPeriodOptions(reportType);
    if (!query) return options.slice(0, 10); // Return first 10 if no query
    
    return options
      .filter(period => period.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }

  // Get file icon based on format
  getFormatIcon(format: string): string {
    const iconMap: Record<string, string> = {
      'pdf': 'document-text',
      'excel': 'table',
      'csv': 'document-text'
    };
    return iconMap[format] || 'document';
  }

  // Get report category (periodic vs content-based)
  getReportCategory(reportType: string): 'periodic' | 'content' {
    const periodicTypes = ['mensuel', 'trimestriel', 'semestriel', 'annuel'];
    return periodicTypes.includes(reportType) ? 'periodic' : 'content';
  }

  // Get report type color for UI
  getReportTypeColor(reportType: string): string {
    const colors: Record<string, string> = {
      'mensuel': 'blue',
      'trimestriel': 'green',
      'semestriel': 'purple',
      'annuel': 'red',
      'activite': 'indigo',
      'financier': 'yellow',
      'indicateurs': 'pink',
      'synthese': 'gray'
    };
    return colors[reportType] || 'gray';
  }

  // Check if period is in the future
  isPeriodInFuture(period: string): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    if (period.match(/^\d{4}$/)) {
      return parseInt(period) > currentYear;
    } else if (period.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = period.split('-').map(Number);
      return year > currentYear || (year === currentYear && month > currentMonth);
    } else if (period.match(/^\d{4}-Q[1-4]$/)) {
      const [year, quarter] = period.split('-');
      const q = parseInt(quarter.substring(1));
      return parseInt(year) > currentYear || (parseInt(year) === currentYear && q > currentQuarter);
    }
    
    return false;
  }
}