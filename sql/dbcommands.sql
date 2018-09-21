CREATE TABLE IF NOT EXISTS marker ( 
id	bigint NOT NULL AUTO_INCREMENT,
user_id bigint  NOT NULL,
name varchar(60)  NOT NULL,
address varchar(80)  NOT NULL,
description text  NOT NULL,
type varchar(30)  NOT NULL,
lat float  NOT NULL,
lng float  NOT NULL,
created datetime  NOT NULL,
modified timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id)
)