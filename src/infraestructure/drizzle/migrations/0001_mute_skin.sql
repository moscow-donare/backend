CREATE TABLE "user_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"birthday" timestamp DEFAULT now(),
	"country" varchar(255) DEFAULT null,
	"state" varchar(255) DEFAULT null,
	"city" varchar(255) DEFAULT null,
	"gender" varchar(10) DEFAULT null,
	"provider" varchar(50) DEFAULT null,
	"photo" varchar(500) DEFAULT null,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;