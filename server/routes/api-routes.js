const http = require('http');

const connection = require('../config/connection.js');

function insertKeywords(index, kw, idjob, cb) {
    let t_index = index;
    let kw_id;
    if (index < kw.length) {
        // if the "keyword" exists already, we need just to take its id ...
        connection.query("select idkeyword from keyword where word = '" + kw[index] + "'", (err, data01) => {
            if (!err) {
                t_index++;
                if (data01.length > 0) {
                    kw_id = data01[0].idkeyword;
                    query = "insert into job_has_keyword (job_idjob, keyword_idkeyword) values (" + idjob + ", " + kw_id + ")";
                    connection.query(query, (err, data3) => {
                        if (err) console.log("Error, could not make insertion into 'job_has_keyword, err: " + err);
                        insertKeywords(t_index, kw, idjob, cb);
                    });
                }
                else {
                    query = "insert into keyword (word) values ('" + kw[index] + "')";
                    connection.query(query, (err, data1) => {
                        if (!err) {
                            connection.query("SELECT last_insert_id()", (err, data2) => {
                                if (!err) {
                                    kw_id = data2[0]["last_insert_id()"];
                                    query = "insert into job_has_keyword (job_idjob, keyword_idkeyword) values (" + idjob + ", " + kw_id + ")";
                                    connection.query(query, (err, data3) => {
                                        if (err) console.log("Error, could not make insertion into 'job_has_keyword', err: " + err);
                                        if (t_index == kw.length)
                                            cb("Insertion is Successfully Done!");
                                        insertKeywords(t_index, kw, idjob, cb)
                                    });
                                }
                                else console.log("Error, could not get the last id of keyword, err: " + err);
                            });
                        }
                        else console.log("Error of the insertion of the keyword '" + kw[i] + "', err: " + err);
                    });
                }
            }
            else console.log("Error, could not select idkeyword from keyword, err: " + err);
        });
    }
}

module.exports = function (app) {
    app.post('/api/job/add', (req, res) => {
        let company = req.body.company;
        let contact = req.body.hr_contact;
        let job = req.body;
        let query = "insert into company (name) values ('" + req.body.company.name.replace(/'/gi, "''") + "')";
        connection.query(query, (err, data) => {
            if (err) console.log("Error, could not insert into company name: '" + company.name + "', err: " + err);
            else {
                //get "idcompany"
                connection.query("SELECT last_insert_id()", (err, data1) => {
                    if (!err) {
                        let idcompany = data1[0]["last_insert_id()"];
                        // insert location
                        let query_location = "insert into location (address, county, state) values ('" + company.address + "', '" +
                            company.county + "', '" + company.state + "')";
                        connection.query(query_location, (err, data2) => {
                            if (!err) {
                                //get "idcompany"
                                connection.query("SELECT last_insert_id()", (err, data2_1) => {
                                    if (!err) {
                                        connection.query("insert into company_has_location (company_idcompany, " +
                                            "location_idlocation) values (" + idcompany + ", " + data2_1[0]["last_insert_id()"] +
                                            ")", (err, data5) => {
                                                if (err) console.log("Error, could not insert into company_has_location, err: " + err);
                                            });
                                    }
                                    else console.log("Error, could not get location's id, err: " + err);
                                });
                            }
                            else console.log("Error, could insert into location, err: " + err);
                        });
                        // insert human ressource contact
                        if (contact.email.length || contact.phone.length) {
                            let query_contact = "insert into hr_contact (name, email, phone, position, company_idcompany) values ('" +
                                contact.name + "', '" + contact.email + "', '" + contact.phone + "', '" + contact.position + "', " +
                                idcompany + ")";
                            connection.query(query_contact, (err, data3) => {
                                if (err) console.log("Error, could not insert into hr_contact, err: " + err);
                            });
                        }
                        // insert job with company id
                        let query_job = "insert into job (title, description, url, isNegativeAnswer, reply, " +
                            "apply_date, company_idcompany) values ('" +
                            job.title + "', '" + job.description + "', '" + job.url + "', " + (job.isNegativeAnswer ? 1 : 0) + ", '" +
                            job.reply + "', '" + job.apply_date + "', " + idcompany + ")";
                        connection.query(query_job, (err, data4) => {
                            if (err) console.log("Error, could not insert into job, err: " + err);
                            else {
                                connection.query("SELECT last_insert_id()", (err, data4_1) => {
                                    if (!err) {
                                        let idjob = data4_1[0]["last_insert_id()"];
                                        // Insertion of all keywords
                                        let kw = req.body.keywords[0].length > 0 ? req.body.keywords[0].split(",").map(a => a.trim()) : [];
                                        if (kw.length)
                                            insertKeywords(0, kw, idjob, function (msg) { res.send(msg); });
                                    }
                                    else console.log("Error, could not get last_insert_id() of insert into job, err: " + err);
                                });
                            }
                        });
                    }
                    else console.log("Error, could not get company's id, err: " + err);
                });
            }
        }); // insert into company
    });

    app.put('/api/job/update', (req, res) => {
        // update "job"
        var job_query = "update job set " +
            "isNegativeAnswer = " + (req.body.isNegativeAnswer ? 1 : 0) +
            ", reply = '" + req.body.reply.replace(/'/gi, "''") +
            "' where idjob = " + req.body.idjob;
        connection.query(job_query, (err, data) => {
            if (!err)
                res.status(200).json("Updated!");
            else console.log("Could not update update location, err: " + err);
        }); // update job 
    });

    app.get('/api/job/all', (req, res) => {
        // >>>>>>>>>>>>>> New Version using "VIEW" <<<<<<<<<<<<<<<
        var query = "select leftWing.*, job_kw.keywords from " + 
                        "(select idjob, title, description, url, isNegativeAnswer, reply, apply_date, vc.company, vc.hrc as hr_contact from job " +
                        "left join v_company vc " + 
                        "on vc.idcompany = job.company_idcompany) leftWing " + 
                    "left join job_kw " + 
                    "on job_kw.idjob = leftWing.idjob";

        // >>>>>>>>>>>>>> Old Version without using "VIEW" <<<<<<<<<<<<<<<
        // var query = "select left_side.*, kw.keywords from " + 
        //                 "(select job.idjob, title, description, url, isNegativeAnswer, reply, apply_date, com_w_cont.comp as company, com_w_cont.hrc as hr_contact from job  " +
        //                 "left join " + 
        //                     "(select com_loc.idcompany, json_object('idcompany', com_loc.idcompany, 'name', com_loc.name, 'address', com_loc.address, 'county', com_loc.county, 'state', com_loc.state) as comp, contact.hrc from " +
        //                         "(select company.idcompany, name, locat.address, locat.county, locat.state from company " +
        //                 "join " + 
        //                             "(select chl.company_idcompany as idcompany, l.address, l.county, l.state from company_has_location chl " +
        //                 "left join location l " + 
        //                 "on l.idlocation = chl.location_idlocation) locat " + 
        //                 "on locat.idcompany = company.idcompany) com_loc " + 
        //                 "left join " + 
        //                         "(select hc.company_idcompany as idcompany, json_object('idhr_contact', hc.idhr_contact, 'name', hc.name, 'email', hc.email, 'phone', hc.phone, 'position', hc.position) as hrc from hr_contact hc) contact " +
        //                 "on com_loc.idcompany = contact.idcompany " + 
        //                 "group by com_loc.idcompany) com_w_cont " + 
        //                 "on com_w_cont.idcompany = job.company_idcompany " + 
        //                 "group by job.idjob) left_side " + 
        //             "left join " + 
        //                 "(select jhk.job_idjob as idjob, group_concat(word) as keywords from keyword " +
        //                 "left join job_has_keyword jhk " + 
        //                 "on jhk.keyword_idkeyword = keyword.idkeyword " + 
        //                 "group by idjob) kw " + 
        //             "on kw.idjob = left_side.idjob " + 
        //             "group by left_side.idjob";
        connection.query(query, (err, data) => {
            if (err) res.json(err);
            else res.status(200).json(data);
        });
    });

    app.get('/api/job/all/most-recent-first', (req, res) => {
        // >>>>>>>>>>>>>> New Version using "VIEW" <<<<<<<<<<<<<<<
        var query = "select leftWing.*, job_kw.keywords from " + 
                        "(select idjob, title, description, url, isNegativeAnswer, reply, apply_date, vc.company, vc.hrc as hr_contact from job " +
                        "left join v_company vc " + 
                        "on vc.idcompany = job.company_idcompany) leftWing " + 
                    "left join job_kw " + 
                    "on job_kw.idjob = leftWing.idjob order by leftWing.apply_date desc";

        // >>>>>>>>>>>>>> Old Version without using "VIEW" <<<<<<<<<<<<<<< 
        // var query = "select jk.idjob, jk.title, jk.description, jk.url, jk.isNegativeAnswer, jk.reply,  " +
        //     "jk.apply_date, company_info.company, company_info.hr_contact, jk.keywords from " +
        //     "(select j.idjob, j.company_idcompany, j.title, j.description, j.url, j.isNegativeAnswer,  " +
        //     "j.reply, j.apply_date, group_concat(job_kw.word) as keywords from job j " +
        //     "left join job_kw " +
        //     "on job_kw.idjob = j.idjob order by j.apply_date DESC" +
        //     "group by j.idjob) jk " +
        //     "left join  " +
        //     "(select comp.idcompany as idcompany, comp.company, contact_json.hrc as hr_contact from " +
        //     "(select c.idcompany as idcompany, json_object('idcompany', c.idcompany, 'name',  " +
        //     "c.name, 'address', address, 'county', county, 'state', state) as company from company c " +
        //     "join company_location cl " +
        //     "on cl.company_idcompany = c.idcompany) comp " +
        //     "left join contact_json " +
        //     "on contact_json.idcompany = comp.idcompany) company_info " +
        //     "on company_info.idcompany = jk.company_idcompany " +
        //     "group by jk.idjob ";
        connection.query(query, (err, data) => {
            if (err) res.json(err);
            else res.status(200).json(data);
        });
    });


    app.get('/api/job/byid/:idjob', (req, res) => {
        // >>>>>>>>>>>>>> New Version using "VIEW" <<<<<<<<<<<<<<<
        var query = "select leftWing.*, job_kw.keywords from " + 
                        "(select idjob, title, description, url, isNegativeAnswer, reply, apply_date, vc.company, vc.hrc as hr_contact from job " +
                        "left join v_company vc " + 
                        "on vc.idcompany = job.company_idcompany where job.idjob = " + req.params.idjob + ") leftWing " + 
                    "left join job_kw " + 
                    "on job_kw.idjob = leftWing.idjob";

        // >>>>>>>>>>>>>> Old Version without using "VIEW" <<<<<<<<<<<<<<<
        // var query = "select left_side.*, kw.keywords from " + 
        //                 "(select job.idjob, title, description, url, isNegativeAnswer, reply, apply_date, com_w_cont.comp as company, com_w_cont.hrc as hr_contact from job  " +
        //                 "left join " + 
        //                     "(select com_loc.idcompany, json_object('idcompany', com_loc.idcompany, 'name', com_loc.name, 'address', com_loc.address, 'county', com_loc.county, 'state', com_loc.state) as comp, contact.hrc from " +
        //                         "(select company.idcompany, name, locat.address, locat.county, locat.state from company " +
        //                 "join " + 
        //                             "(select chl.company_idcompany as idcompany, l.address, l.county, l.state from company_has_location chl " +
        //                 "left join location l " + 
        //                 "on l.idlocation = chl.location_idlocation) locat " + 
        //                 "on locat.idcompany = company.idcompany) com_loc " + 
        //                 "left join " + 
        //                         "(select hc.company_idcompany as idcompany, json_object('idhr_contact', hc.idhr_contact, 'name', hc.name, 'email', hc.email, 'phone', hc.phone, 'position', hc.position) as hrc from hr_contact hc) contact " +
        //                 "on com_loc.idcompany = contact.idcompany " + 
        //                 "group by com_loc.idcompany) com_w_cont " + 
        //                 "on com_w_cont.idcompany = job.company_idcompany " + 
        //                 "group by job.idjob) left_side " + 
        //             "left join " + 
        //                 "(select job_kw.idjob, group_concat(word) as keywords from job_kw " +
        //                 "group by idjob) kw " + 
        //             "on kw.idjob = left_side.idjob where left_side.idjob = " +  req.params.idjob + " "
        //             "group by left_side.idjob";
        connection.query(query, (err, data) => {
            if (err) res.json(err);
            else res.status(200).json(data);
        });
    });

    app.get('/api/job/by-keyword/:kw', (req, res) => {
        // >>>>>>>>>>>>>> New Version using "VIEW" <<<<<<<<<<<<<<<
        var query = "select leftWing.*, rightWing.keywords from   " + 
                        "(select idjob, title, description, url, isNegativeAnswer, reply, apply_date, vc.company, vc.hrc as hr_contact from job  " +
                        "left join v_company vc   " + 
                        "on vc.idcompany = job.company_idcompany) leftWing   " + 
                    "left join  " + 
                        "(select jhk.job_idjob as idjob, group_concat(kw.word) as keywords from job_has_keyword jhk " +
                        "join " + 
                            "(select idkeyword, word from keyword where keyword.word = 'JavaScript') kw " +
                        "on kw.idkeyword = jhk.keyword_idkeyword " + 
                        "group by jhk.job_idjob) rightWing " + 
                    "on rightWing.idjob = leftWing.idjob where rightWing.keywords is not null";

        // >>>>>>>>>>>>>> Old Version without using "VIEW" <<<<<<<<<<<<<<<
        // var query = "select left_side.*, kw.keywords from " + 
        //                 "(select jhk.job_idjob as idjob, group_concat(word) as keywords from keyword " + 
        //                 "left join job_has_keyword jhk " + 
        //                 "on jhk.keyword_idkeyword = keyword.idkeyword where keyword.word = " + req.params.kw + " " + 
        //                 "group by idjob) kw " + 
        //             "left join " + 
        //                 "(select job.idjob, title, description, url, isNegativeAnswer, reply, apply_date, com_w_cont.comp as company, com_w_cont.hrc as hr_contact from job  " + 
        //                 "left join " + 
        //                     "(select com_loc.idcompany, json_object('idcompany', com_loc.idcompany, 'name', com_loc.name, 'address', com_loc.address, 'county', com_loc.county, 'state', com_loc.state) as comp, contact.hrc from " + 
        //                         "(select company.idcompany, name, locat.address, locat.county, locat.state from company " + 
        //                 "join " + 
        //                             "(select chl.company_idcompany as idcompany, l.address, l.county, l.state from company_has_location chl " + 
        //                 "left join location l " + 
        //                 "on l.idlocation = chl.location_idlocation) locat " + 
        //                 "on locat.idcompany = company.idcompany) com_loc " + 
        //                 "left join " + 
        //                         "(select hc.company_idcompany as idcompany, json_object('idhr_contact', hc.idhr_contact, 'name', hc.name, 'email', hc.email, 'phone', hc.phone, 'position', hc.position) as hrc from hr_contact hc) contact " + 
        //                 "on com_loc.idcompany = contact.idcompany " + 
        //                 "group by com_loc.idcompany) com_w_cont " + 
        //                 "on com_w_cont.idcompany = job.company_idcompany " + 
        //                 "group by job.idjob) left_side " + 
        //             "on kw.idjob = left_side.idjob " + 
        //             "group by left_side.idjob ";

        connection.query(query, (err, data) => {
            if (err) res.json(err);
            else res.status(200).json(data);
        });
    });
    
    app.get('/api/job/reply-recent', (req, res) => {
        // >>>>>>>>>>>>>> New Version using "VIEW" <<<<<<<<<<<<<<<
        var query = "select leftWing.*, job_kw.keywords from " + 
                        "(select idjob, title, description, url, isNegativeAnswer, reply, apply_date, vc.company, vc.hrc as hr_contact from job " +
                        "left join v_company vc " + 
                        "on vc.idcompany = job.company_idcompany) leftWing " + 
                    "left join job_kw " + 
                    "on job_kw.idjob = leftWing.idjob  where leftWing.isNegativeAnswer = 0 order by leftWing.apply_date desc";

        // >>>>>>>>>>>>>> Old Version without using "VIEW" <<<<<<<<<<<<<<<
        // var query = "select left_side.*, kw. keywords from " + 
        //                 "(select job.idjob, title, description, url, isNegativeAnswer, reply, apply_date, com_w_cont.comp as company, com_w_cont.hrc as hr_contact from job " +
        //                 "left join " + 
        //                     "(select com_loc.idcompany, json_object('idcompany', com_loc.idcompany, 'name', com_loc.name, 'address', com_loc.address, 'county', com_loc.county, 'state', com_loc.state) as comp, contact.hrc from " +
        //                         "(select company.idcompany, name, locat.address, locat.county, locat.state from company " +
        //                 "join " + 
        //                     "(select chl.company_idcompany as idcompany, l.address, l.county, l.state from company_has_location chl " +
        //                 "left join location l " + 
        //                 "on l.idlocation = chl.location_idlocation) locat " + 
        //                 "on locat.idcompany = company.idcompany) com_loc " + 
        //                 "left join " + 
        //                         "(select hc.company_idcompany as idcompany, json_object('idhr_contact', hc.idhr_contact, 'name', hc.name, 'email', hc.email, 'phone', hc.phone, 'position', hc.position) as hrc from hr_contact hc) contact " +
        //                 "on com_loc.idcompany = contact.idcompany " + 
        //                 "group by com_loc.idcompany) com_w_cont " + 
        //                 "on com_w_cont.idcompany = job.company_idcompany where job.isNegativeAnswer = 0 " + 
        //                 "group by job.idjob) left_side " + 
        //             "left join " + 
        //                 "(select jhk.job_idjob as idjob, group_concat(word) as keywords from keyword " +
        //                 "left join job_has_keyword jhk " + 
        //                 "on jhk.keyword_idkeyword = keyword.idkeyword " + 
        //                 "group by idjob) kw     " + 
        //             "on kw.idjob = left_side.idjob " + 
        //             "group by left_side.idjob ";
        connection.query(query, (err, data) => {
            if (err) res.json(err);
            else
                res.status(200).json(data);
        });
    });

    app.get('/api/job/by-no-reply-yet', (req, res) => {
        // >>>>>>>>>>>>>> New Version using "VIEW" <<<<<<<<<<<<<<<
        var query = "select leftWing.*, job_kw.keywords from " + 
                        "(select idjob, title, description, url, isNegativeAnswer, reply, apply_date, vc.company, vc.hrc as hr_contact from job " +
                        "left join v_company vc " + 
                        "on vc.idcompany = job.company_idcompany) leftWing " + 
                    "left join job_kw " + 
                    "on job_kw.idjob = leftWing.idjob  where leftWing.isNegativeAnswer = 0";

        // >>>>>>>>>>>>>> Old Version without using "VIEW" <<<<<<<<<<<<<<<
        // var query = "select left_side.*, kw. keywords from " + 
        //                 "(select job.idjob, title, description, url, isNegativeAnswer, reply, apply_date, com_w_cont.comp as company, com_w_cont.hrc as hr_contact from job " +
        //                 "left join " + 
        //                     "(select com_loc.idcompany, json_object('idcompany', com_loc.idcompany, 'name', com_loc.name, 'address', com_loc.address, 'county', com_loc.county, 'state', com_loc.state) as comp, contact.hrc from " +
        //                         "(select company.idcompany, name, locat.address, locat.county, locat.state from company " +
        //                 "join " + 
        //                     "(select chl.company_idcompany as idcompany, l.address, l.county, l.state from company_has_location chl " +
        //                 "left join location l " + 
        //                 "on l.idlocation = chl.location_idlocation) locat " + 
        //                 "on locat.idcompany = company.idcompany) com_loc " + 
        //                 "left join " + 
        //                         "(select hc.company_idcompany as idcompany, json_object('idhr_contact', hc.idhr_contact, 'name', hc.name, 'email', hc.email, 'phone', hc.phone, 'position', hc.position) as hrc from hr_contact hc) contact " +
        //                 "on com_loc.idcompany = contact.idcompany " + 
        //                 "group by com_loc.idcompany) com_w_cont " + 
        //                 "on com_w_cont.idcompany = job.company_idcompany where job.isNegativeAnswer = 0 " + 
        //                 "group by job.idjob) left_side " + 
        //             "left join " + 
        //                 "(select jhk.job_idjob as idjob, group_concat(word) as keywords from keyword " +
        //                 "left join job_has_keyword jhk " + 
        //                 "on jhk.keyword_idkeyword = keyword.idkeyword " + 
        //                 "group by idjob) kw     " + 
        //             "on kw.idjob = left_side.idjob " + 
        //             "group by left_side.idjob ";
        connection.query(query, (err, data) => {
            if (err) res.json(err);
            else
                res.status(200).json(data);
        });
    });

    app.delete('/api/job/:idjob', (req, res) => {
        var query = "delete pa from props_ans pa " +
            "left join question q on q.idquestion = pa.question_idquestion " +
            "where q.quiz_idquiz = " + req.params.quizid;
        connection.query(query, (err, data) => {
            if (!err) {
                query = "delete from question where quiz_idquiz = " + req.params.quizid;
                connection.query(query, (err, data1) => {
                    if (!err) {
                        connection.query("delete from quiz where idquiz = " + req.params.quizid, (err, data2) => {
                            if (err)
                                console.log("Error, Could not Delete the Quiz with the Id of " + req.params.quizid + ", err: " + err);
                            else res.status(200).json("Success");
                        }); // delete from quiz
                    } // delete from question
                    else
                        console.log("Error, Could not Delete Questions of Quiz with the Id of " + req.params.quizid + ", err: " + err);
                }); // delete from question

            } // delete pa from props_ans
            else
                console.log("Error, Could not Delete Proposed Answers of Quiz  with the Id of " + req.params.quizid + ", err: " + err);
        }); // delete pa from props_ans
    });
}


