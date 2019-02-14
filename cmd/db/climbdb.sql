-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema climbdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema climbdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `climbdb` DEFAULT CHARACTER SET utf8 ;
USE `climbdb` ;

-- -----------------------------------------------------
-- Table `climbdb`.`climb_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`climb_types` (
  `climb_type_id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`climb_type_id`),
  UNIQUE INDEX `type_UNIQUE` (`type` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `climbdb`.`grades`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`grades` (
  `grade_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `climb_type` INT NOT NULL,
  PRIMARY KEY (`grade_id`),
  INDEX `type_idx` (`climb_type` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  CONSTRAINT `grade_climb_type`
    FOREIGN KEY (`climb_type`)
    REFERENCES `climbdb`.`climb_types` (`climb_type_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `climbdb`.`setters`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`setters` (
  `setter_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`setter_id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `climbdb`.`routes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`routes` (
  `route_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `grade` INT NOT NULL,
  `date` DATE NOT NULL,
  `setter` INT NOT NULL,
  `color` VARCHAR(6) NULL,
  `route_address` VARCHAR(12) NULL,
  `position` VARCHAR(5) NULL,
  `is_current` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`route_id`),
  INDEX `grade_idx` (`grade` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `setter_idx` (`setter` ASC) VISIBLE,
  CONSTRAINT `route_grade`
    FOREIGN KEY (`grade`)
    REFERENCES `climbdb`.`grades` (`grade_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `setter`
    FOREIGN KEY (`setter`)
    REFERENCES `climbdb`.`setters` (`setter_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `climbdb`.`climbers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`climbers` (
  `climber_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`climber_id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `climbdb`.`attempt_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`attempt_types` (
  `attempt_type_id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`attempt_type_id`),
  UNIQUE INDEX `type_UNIQUE` (`type` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `climbdb`.`climbs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `climbdb`.`climbs` (
  `climb_id` INT NOT NULL AUTO_INCREMENT,
  `climber` INT NOT NULL,
  `date` DATE NOT NULL,
  `route` INT NOT NULL,
  `attempt` INT NOT NULL,
  PRIMARY KEY (`climb_id`),
  INDEX `route_idx` (`route` ASC) VISIBLE,
  INDEX `climber_idx` (`climber` ASC) VISIBLE,
  INDEX `attempt_idx` (`attempt` ASC) VISIBLE,
  UNIQUE INDEX `unique_climb_idx` (`climber` ASC, `date` ASC, `route` ASC) VISIBLE,
  CONSTRAINT `route`
    FOREIGN KEY (`route`)
    REFERENCES `climbdb`.`routes` (`route_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `attempt`
    FOREIGN KEY (`attempt`)
    REFERENCES `climbdb`.`attempt_types` (`attempt_type_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `climber`
    FOREIGN KEY (`climber`)
    REFERENCES `climbdb`.`climbers` (`climber_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
