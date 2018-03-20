import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { JobService } from '../services/job.service';

import { JobModel } from '../models/job.model';

@Component({
    moduleId: module.id,
    selector: 'job-add',
    templateUrl: `./job.add.component.html`,
})
export class JobAddComponent {
    hasHRContact: boolean = false;
    isNewJob: boolean = true;
    newJob: JobModel = null;

    constructor(private _jobService: JobService, private router: Router) {
        this.newJob = this._jobService.getJobToUpdate();
        if (this.newJob == null) this.setEmptyJobModel();
        else this.isNewJob = false;
    }

    setEmptyJobModel(): void {
        this.newJob = {
            idjob: 0,
            title: "",
            description: "",
            url: "",
            isNegativeAnswer: false,
            reply: "",
            apply_date: this.getNowDate(),
            company: {
                idcompany: 0,
                name: "",
                address: "",
                county: "",
                state: ""
            },
            hr_contact: {
                idhr_contact: 0,
                name: "",
                email: "",
                phone: "",
                position: ""
            },
            keywords: []
        }
        this.newJob.keywords.push("");
    }

    getNowDate(): string {
        var date = new Date();
        var hour = date.getHours();
        return date.getFullYear() + "-" + this.setGoodDateFormat(date.getMonth() + 1) + "-" +
            this.setGoodDateFormat(date.getDate()) + " at " +
            this.setGoodDateFormat(hour >= 12 ? hour - 12 : hour) + ":" + 
            this.setGoodDateFormat(date.getMinutes()) + (hour > 12 ? " PM" : " AM");
    }

    setGoodDateFormat(num: number): string {
        return num < 10 ? "0" + num.toString() : num.toString();
    }

    recordNewJob(): void {
        if (this.isNewJob)
            this._jobService.recordNewJob(this.newJob);
        else this._jobService.updateJob(this.newJob);
        this.router.navigate(['']);
    }

    cancel(): void {
        this.setEmptyJobModel();
        this.router.navigate(['']);
    }
}