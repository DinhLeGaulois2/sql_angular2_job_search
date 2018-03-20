-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema job_search_mysql
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema job_search_mysql
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `job_search_mysql` DEFAULT CHARACTER SET utf8 ;
USE `job_search_mysql` ;

-- -----------------------------------------------------
-- Table `job_search_mysql`.`company`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`company` (
  `idcompany` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NULL,
  PRIMARY KEY (`idcompany`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `job_search_mysql`.`hr_contact`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`hr_contact` (
  `idhr_contact` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(45) NULL,
  `position` VARCHAR(45) NULL,
  `company_idcompany` INT NOT NULL,
  PRIMARY KEY (`idhr_contact`),
  INDEX `fk_hr_contact_company1_idx` (`company_idcompany` ASC),
  CONSTRAINT `fk_hr_contact_company1`
    FOREIGN KEY (`company_idcompany`)
    REFERENCES `job_search_mysql`.`company` (`idcompany`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `job_search_mysql`.`job`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`job` (
  `idjob` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(250) NULL,
  `description` MEDIUMTEXT NULL,
  `url` VARCHAR(250) NULL,
  `isNegativeAnswer` TINYINT NULL,
  `reply` VARCHAR(150) NULL,
  `apply_date` VARCHAR(100) NULL,
  `company_idcompany` INT NOT NULL,
  PRIMARY KEY (`idjob`),
  INDEX `fk_job_company1_idx` (`company_idcompany` ASC),
  CONSTRAINT `fk_job_company1`
    FOREIGN KEY (`company_idcompany`)
    REFERENCES `job_search_mysql`.`company` (`idcompany`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `job_search_mysql`.`keyword`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`keyword` (
  `idkeyword` INT NOT NULL AUTO_INCREMENT,
  `word` VARCHAR(45) NULL,
  PRIMARY KEY (`idkeyword`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `job_search_mysql`.`job_has_keyword`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`job_has_keyword` (
  `job_idjob` INT NOT NULL,
  `keyword_idkeyword` INT NOT NULL,
  PRIMARY KEY (`job_idjob`, `keyword_idkeyword`),
  INDEX `fk_job_has_keyword_keyword1_idx` (`keyword_idkeyword` ASC),
  INDEX `fk_job_has_keyword_job_idx` (`job_idjob` ASC),
  CONSTRAINT `fk_job_has_keyword_job`
    FOREIGN KEY (`job_idjob`)
    REFERENCES `job_search_mysql`.`job` (`idjob`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_job_has_keyword_keyword1`
    FOREIGN KEY (`keyword_idkeyword`)
    REFERENCES `job_search_mysql`.`keyword` (`idkeyword`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `job_search_mysql`.`location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`location` (
  `idlocation` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(150) NULL,
  `county` VARCHAR(100) NULL,
  `state` VARCHAR(45) NULL,
  PRIMARY KEY (`idlocation`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `job_search_mysql`.`company_has_location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_search_mysql`.`company_has_location` (
  `company_idcompany` INT NOT NULL,
  `location_idlocation` INT NOT NULL,
  PRIMARY KEY (`company_idcompany`, `location_idlocation`),
  INDEX `fk_company_has_location_location1_idx` (`location_idlocation` ASC),
  INDEX `fk_company_has_location_company1_idx` (`company_idcompany` ASC),
  CONSTRAINT `fk_company_has_location_company1`
    FOREIGN KEY (`company_idcompany`)
    REFERENCES `job_search_mysql`.`company` (`idcompany`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_company_has_location_location1`
    FOREIGN KEY (`location_idlocation`)
    REFERENCES `job_search_mysql`.`location` (`idlocation`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> VIEWS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
CREATE OR REPLACE VIEW job_kw AS
	SELECT jhk.job_idjob as idjob, kw.idkeyword, group_concat(kw.word) as keywords FROM keyword kw
	JOIN job_has_keyword jhk
	ON jhk.keyword_idkeyword = kw.idkeyword
    group by jhk.job_idjob;
    
CREATE OR REPLACE VIEW company_location AS
	SELECT chl.company_idcompany, l.idlocation, address, county, state FROM location l
	JOIN company_has_location chl
	ON chl.location_idlocation = l.idlocation;   
    
CREATE OR REPLACE VIEW contact_json AS
	SELECT hc.company_idcompany as idcompany, json_object('idhr_contact', hc.idhr_contact, 'name', hc.name, 'email', hc.email, 'phone', hc.phone, 'position', hc.position) as hrc FROM hr_contact hc;
    
CREATE OR REPLACE VIEW v_company AS
	select comp.idcompany, comp.company, cj.hrc from
		(select c.idcompany, json_object('name', c.name, 'address', cl.address, 'county', cl.county, 'state', cl.state) as company from company c
		left join company_location cl
		on cl.company_idcompany = c.idcompany
		group by c.idcompany) comp
	left join contact_json cj
	on cj.idcompany = comp.idcompany
	group by comp.idcompany;