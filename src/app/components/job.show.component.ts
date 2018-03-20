import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { JobService } from '../services/job.service';

import { JobModel } from '../models/job.model';

@Component({
    moduleId: module.id,
    selector: 'job-show',
    templateUrl: `./job.show.component.html`,
})
export class JobShowComponent {
    isReady: boolean = false;
    allJobs: JobModel[] = [];
    oneJob: JobModel = null;
    isShowAll: boolean = true;
    notYetReply: boolean = false;
    isMostRecentFirst: boolean = false;

    constructor(private _jobService: JobService, private router: Router) {
        this.showWithOption();
    }

    showWithOption(): void {
        this.allJobs = [];
        this.oneJob = null;
        this.isReady = false;
        if (this.notYetReply && !this.isMostRecentFirst)
            this._jobService.getJobsNotYetReplyObservable().subscribe(res => { this.buildList(res); });
        else if (!this.notYetReply && this.isMostRecentFirst)
            this._jobService.getAllJobsMostRecentObservable().subscribe(res => { this.buildList(res); });
        else if (this.notYetReply && this.isMostRecentFirst)
            this._jobService.getNotReplyAndRecentObservable().subscribe(res => { this.buildList(res); });
        else
            this._jobService.getAllJobsObservable().subscribe(res => { this.buildList(res); });
    }

    buildList(res: any): void {
        for (let i = 0; i < res.length; i++) {
            let o = res[i];
            let comp = JSON.parse(o.company);
            let cont = JSON.parse(o.hr_contact);
            this.allJobs.push(this.jobStructDB2Angular(o));
        }
        if (this.allJobs.length)
             this.isShowAll = true;
        this.isReady = true;
    }

    showJob(idjob: number): void {
        this.oneJob = null;
        for (let i = 0; i < this.allJobs.length; i++)
            if (this.allJobs[i].idjob == idjob) {
                this.oneJob = this.allJobs[i];
                break;
            }
        if (this.oneJob) this.isShowAll = false;
    }

    isContactExist(): boolean {
        return (this.oneJob.hr_contact.email==null && this.oneJob.hr_contact.phone==null) ? false : true;
    }

    showAll(): void {
        this.isShowAll = true;
        this._jobService.setJobToUpdate(null);
        this.router.navigate(['job/show']);
    }

    edit(): void {
        this._jobService.setJobToUpdate(this.oneJob);
        this.router.navigate(['job/add']);
    }

    jobStructDB2Angular(o: any): JobModel {
        let comp = JSON.parse(o.company);
        let cont = JSON.parse(o.hr_contact);
        let contact;
        if (cont == null)
            contact = {
                idhr_contact: -1,
                name: "",
                email: "",
                phone: "",
                position: ""
            }
        else
            contact = {
                idhr_contact: cont.idhr_contact,
                name: cont.name,
                email: cont.email,
                phone: cont.phone,
                position: cont.position
            };

        return {
            idjob: o.idjob,
            title: o.title,
            description: o.description,
            url: o.url,
            isNegativeAnswer: o.isNegativeAnswer == 1 ? true : false, // need to transform into "boolean"
            reply: o.reply,
            apply_date: o.apply_date,
            company: {
                idcompany: comp.idcompany,
                name: comp.name,
                address: comp.address,
                county: comp.county,
                state: comp.state
            },
            hr_contact: contact,
            keywords: o.keywords.length ? o.keywords.split(",") : [] // transform "string" (group_concat) into "array"
        }
    }
}