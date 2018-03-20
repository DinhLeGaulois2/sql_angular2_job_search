import { JobHRContactModel } from './job.hr-contact.model';
import { JobCompanyModel } from './job.company.model';

export interface JobModel {
    idjob: number,
    title: string,
    description: string,
    url: string,
    isNegativeAnswer: boolean,
    reply: string,
    apply_date: string,
    company: JobCompanyModel,
    hr_contact: JobHRContactModel,
    keywords: string[]
}