import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { JobModel } from '../models/job.model';
import { JobHRContactModel } from '../models/job.hr-contact.model';
import { JobCompanyModel } from '../models/job.company.model';

@Injectable()
export class JobService {
    jobToUpdate: JobModel = null;
    constructor(private _http: Http) {
    }

    recordNewJob(newJob: JobModel): void {
        this.jobToUpdate = null;
        this._http.post('/api/job/add', newJob).subscribe();
    }

    setJobToUpdate(job: JobModel): void{
        this.jobToUpdate = job;
    }

    getAllJobsObservable(): Observable<any>{
        return this._http.get("/api/job/all").map(res => res.json());
    }
    
    getAllJobsMostRecentObservable(): Observable<any>{
        return this._http.get("/api/job/all/most-recent-first").map(res => res.json());
    }
    
    getJobsNotYetReplyObservable(): Observable<any>{
        return this._http.get("/api/job/by-no-reply-yet").map(res => res.json());
    }   
    
    getNotReplyAndRecentObservable(): Observable<any>{
        return this._http.get("/api/job/reply-recent").map(res => res.json());
    }

    updateJob(job: JobModel):void{        
        this._http.put('/api/job/update', job).subscribe();
    }

    getJobToUpdate(): JobModel{
        return this.jobToUpdate;
    }
}