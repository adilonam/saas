--
-- PostgreSQL database dump
--

\restrict pw9exCyYlm2lA7wEQxGzn4uJ21fIt3gB9AWiDkg4C5xzRnLrdJhm6qdRtSrwloy

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg11+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: Color; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."Color" AS ENUM (
    'RED',
    'BLUE'
);


SET default_table_access_method = "heap";

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."Account" (
    "id" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "type" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "providerAccountId" "text" NOT NULL,
    "refresh_token" "text",
    "access_token" "text",
    "expires_at" integer,
    "token_type" "text",
    "scope" "text",
    "id_token" "text",
    "session_state" "text"
);


--
-- Name: History; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."History" (
    "id" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "action" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."Session" (
    "id" "text" NOT NULL,
    "sessionToken" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "expires" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."User" (
    "id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "password" "text",
    "name" "text",
    "emailVerified" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "subscriptionExpiresAt" timestamp(3) without time zone,
    "waitlistNumber" integer DEFAULT 234 NOT NULL
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."VerificationToken" (
    "identifier" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."Account" ("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") FROM stdin;
\.


--
-- Data for Name: History; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."History" ("id", "userId", "action", "description", "metadata", "createdAt") FROM stdin;
cmle0dzib000004juqevb6o1h	cmkx46go1000004jusig076ly	subscription_started	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "NOCLRcEJHSr5PAaxAXJenA==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2026-03-10T17:20:18.153Z", "subscriptionId": "I2ERPF71aUQTtf0RDgmH0Q==", "previousExpiresAt": null}	2026-02-08 17:20:18.179
cmle0eqom000104ju1oj2rez4	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad annual: +365 days (ManagePdf.site yearly subscription)	{"plan": "annual", "saleId": "3fLIQUwE9Cu2DxJUCEZmuw==", "source": "gumroad", "daysAdded": 365, "productId": "C-Sk-WxdmQp59-CRW0RPYw==", "recurrence": "yearly", "productName": "ManagePdf.site yearly subscription", "newExpiresAt": "2027-03-10T17:20:18.153Z", "subscriptionId": "HZ9yQkoxrt9El9GJSPn2pg==", "previousExpiresAt": "2026-03-10T17:20:18.153Z"}	2026-02-08 17:20:53.398
cmle0vgxz000004lbkwu789yg	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "6SPPrWLsazzRAoaY1k840Q==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-04-09T17:20:18.153Z", "subscriptionId": "smuOZJQAbmo40OGj2B-U_w==", "previousExpiresAt": "2027-03-10T17:20:18.153Z"}	2026-02-08 17:33:53.927
cmle1bze5000104ju63j4k933	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "otzjf39uc5qBOslMcKIA2w==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-05-09T17:20:18.153Z", "subscriptionId": "CVTZjwg49RC8VFNO8JjUzQ==", "previousExpiresAt": "2027-04-09T17:20:18.153Z"}	2026-02-08 17:46:44.333
cmle1icef000204juo4b384dc	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "Crf7z2WiN4MuL-s4wQrwhg==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-06-08T17:20:18.153Z", "subscriptionId": "GCD2GZqyamt7xC3qDoG9aQ==", "previousExpiresAt": "2027-05-09T17:20:18.153Z"}	2026-02-08 17:51:41.127
cmle1pmr7000304juqc1mfodo	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "8JHUkRwraehjb1N5tZLQcA==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-07-08T17:20:18.153Z", "subscriptionId": "8wa_1ywSn-vZEHctwGvrBg==", "previousExpiresAt": "2027-06-08T17:20:18.153Z"}	2026-02-08 17:57:21.139
cmle1vu2v000404judwhcjcns	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "kVUqFMxONQ10FKuqPEyNcQ==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-08-07T17:20:18.153Z", "subscriptionId": "XbEqnI-ztmFLV1Hg56iDaw==", "previousExpiresAt": "2027-07-08T17:20:18.153Z"}	2026-02-08 18:02:10.567
cmle1wh3b000504jukc9gfp5c	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "IVqDax__ncXXIO0lxpf_0w==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-09-06T17:20:18.153Z", "subscriptionId": "r6WRc13EPVsZnzXTdShZbQ==", "previousExpiresAt": "2027-08-07T17:20:18.153Z"}	2026-02-08 18:02:40.391
cmle1y5hj000604juhtgps1j1	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "p4wWIo5K33vaT9fREJUCHA==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-10-06T17:20:18.153Z", "subscriptionId": "NzFwBNKpoGIhtvKwU-J53Q==", "previousExpiresAt": "2027-09-06T17:20:18.153Z"}	2026-02-08 18:03:58.663
cmle25pp5000704juyq82nnz0	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "3bE2jrpdPli7JqD1YVQlDw==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2027-11-05T17:20:18.153Z", "subscriptionId": "GuGhtvtx9933t8G6hDc2lQ==", "previousExpiresAt": "2027-10-06T17:20:18.153Z"}	2026-02-08 18:09:51.449
cmle2eksi000804juimhp76nj	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad annual: +365 days (ManagePdf.site yearly subscription)	{"plan": "annual", "saleId": "PA-TWmyx9P2IvwUj7qVJLw==", "source": "gumroad", "daysAdded": 365, "productId": "C-Sk-WxdmQp59-CRW0RPYw==", "recurrence": "yearly", "productName": "ManagePdf.site yearly subscription", "newExpiresAt": "2028-11-04T17:20:18.153Z", "subscriptionId": "Q3Z2LhHiZo7slLzwq8MLxA==", "previousExpiresAt": "2027-11-05T17:20:18.153Z"}	2026-02-08 18:16:44.994
cmleb3f55000004l4tnhb96c8	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "RdIAvzbepa-trsTfZQaBpg==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2028-12-04T17:20:18.153Z", "subscriptionId": "iKZTbsvuDNIv7fcJ1iNilg==", "previousExpiresAt": "2028-11-04T17:20:18.153Z"}	2026-02-08 22:20:01
cmlmk7fer000004jlc6r3wdju	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "Mnd8qhM0nn_qELDAUl9Z2A==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2029-01-03T17:20:18.153Z", "subscriptionId": "bJM6GOOB24XdSmviwl4IZA==", "previousExpiresAt": "2028-12-04T17:20:18.153Z"}	2026-02-14 16:57:13.923
cmlmkc97k000004lfna8fna7w	cmkx46go1000004jusig076ly	subscription_renewed	Gumroad monthly: +30 days (ManagePdf.site monthly subscription)	{"plan": "monthly", "saleId": "69nDYcWGLnYIErVTxM8A8w==", "source": "gumroad", "daysAdded": 30, "productId": "c-nFZjkEyleHad0M8xlbhA==", "recurrence": "monthly", "productName": "ManagePdf.site monthly subscription", "newExpiresAt": "2029-02-02T17:20:18.153Z", "subscriptionId": "Gq8Z5m960qZLeydCgXJjjw==", "previousExpiresAt": "2029-01-03T17:20:18.153Z"}	2026-02-14 17:00:59.167
cmlmkdnto000104lfaghxjl3a	cmjqd39g4000004jvmr26agl4	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:04.764
cmlmkdnxd000204lf3b4r91dp	cmjvoz3sc000004lhtl5nnngd	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:04.897
cmlmkdnzt000304lf74rtix87	cmkw3xk4n000804lb5zi2xz3z	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:04.985
cmlmkdo1x000404lfl2b0az7t	cmkw4cxkn000904lbi4xa1qkv	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.061
cmlmkdo49000504lfmuxgqwd4	cmkw4dukd000a04lbx7lyqbsn	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.145
cmlmkdo6l000604lf4j5cpqzj	cmkw4f9qh000b04lb02dneig7	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.229
cmlmkdo8l000704lfkjq9urkr	cmkw4hlp1000c04lbaw8qnlq0	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.301
cmlmkdob7000804lfoukmjpf1	cmkw4iy6z000d04lb7ky2j3bu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.394
cmlmkdod7000904lflcgjyiob	cmkw4q8a5000004l2tbf4znko	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.466
cmlmkdof7000a04lfbx30k6vi	cmjvz9ujo000004i2otfiop2e	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.539
cmlmkdohk000b04lfj9xkk20j	cmkljgxfy000404ldmogdzg1v	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.624
cmlmkdojt000c04lfupwvt4n6	cmkljjb0y000504ldarypkslh	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.705
cmlmkdolz000d04lfrz73i4am	cmkljlo22000604ldy8dogk7a	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.783
cmlmkdoo5000e04lf0cti38qs	cmkw4tspx000104l2uh3bz0vs	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.861
cmlmkdoql000f04lf9ygerojh	cmkw54r6i000004inuwk14pri	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:05.949
cmlmkdot3000g04lfvvl9kgo5	cmkw6ctyj000004k1eqbf884e	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.038
cmlmkdov8000h04lf9e74dkh4	cmkw6e7t3000104k19fwt94i6	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.116
cmlmkdozh000i04lf8lgdnh1o	cmkvmvtik000004kwpoc7jtpq	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.269
cmlmkdp1e000j04lf4vl91tvc	cmkvo7d6v000004i51eoc31ek	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.338
cmlmkdp40000k04lfv3wvq40x	cmkvo8oj5000004jmkmw21ei6	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.432
cmlmkdp5z000l04lf1e0jha7y	cmjqd442r000104jvva1kg5ew	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.503
cmlmkdp85000m04lfxbe2z5mk	cmkvpi6mn000004l84y1f5cyb	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.581
cmlmkdp9v000n04lf4h7k85oh	cmkvpow9k000104l8ck2kemvi	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.643
cmlmkdpbz000o04lfk63y1cwe	cmkvpwwir000204l8l9zenhv5	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.719
cmlmkdpdp000p04lf45ecqbfv	cmkvt1b59000004k04o4fzktc	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.781
cmlmkdpfu000q04lfnearj4zb	cmkvw3d0k000004l23ed5yvkj	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.858
cmlmkdpjd000r04lf9t3f6fp0	cmkvwgb26000104l2snz41twx	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:06.985
cmlmkdpm7000s04lfvfkfaebr	cmkvwx3im000004l8wjpnfcyu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.087
cmlmkdptx000t04lf8vsfnnzl	cmkvy2ij9000004kzz0ffjr85	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.365
cmlmkdpvy000u04lf1fvktl0v	cmkvy7d5j000104kzzdteakr8	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.438
cmlmkdpxu000v04lff95jb3lz	cmkvyhy0n000004jocvh409pg	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.506
cmlmkdpzt000w04lfg2ny5fdr	cmkvyrqvy000004l8l2821ssg	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.577
cmlmkdq1u000x04lfq0tnsmaj	cmkvz37qw000104l8g3339log	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.65
cmlmkdq3v000y04lflhwknsuy	cmkvz8pwc000204l83su7tq7w	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.723
cmlmkdq5y000z04lfb8pi47eh	cmkvz9jca000304l8naekwh5n	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.798
cmlmkdq8d001004lf8ret1mcv	cmkvzb8ba000404l8xjzrei66	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.885
cmlmkdqah001104lfkhe436p0	cmkw14u2n000004jgclqk71wm	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:07.961
cmlmkdqcr001204lfrtblk2vx	cmkw1ddvv000104jgte6oqnjg	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.043
cmlmkdqf0001304lfuvuwkc3a	cmkw1dlo2000204jgwkq4vxwp	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.124
cmlmkdqio001404lfqzful8ms	cmkw1ftjb000304jg6o02lcz5	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.256
cmlmkdqkl001504lf2dt13aa9	cmkw1j3du000404jgd0uznkp6	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.325
cmlmkdqml001604lfcbtlts5g	cmkw1uou7000004l8s5bozxjy	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.397
cmlmkdqow001704lf4xl3v6rj	cmkw1zbdh000104l8r0eqa0n1	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.48
cmlmkdqqq001804lfg85q55ab	cmkw20vl9000204l8xfa6x2f1	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.546
cmlmkdqst001904lf6ko6bhnb	cmkw2kky8000004lbgatszkxm	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.621
cmlmkdqv8001a04lf6ypn5xas	cmkw2q4su000104lbdk6ioyqw	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.708
cmlmkdqx5001b04lfuzq1qqkv	cmkw2ukrs000204lb5tvoo77g	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.777
cmlmkdqz1001c04lfme3xp54g	cmkw3dr7j000304lb7f4uyhko	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.845
cmlmkdr1j001d04lf6s4rjlkn	cmkw3jzkj000404lbhlrzf9ht	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:08.935
cmlmkdr44001e04lf0yuvz4x1	cmkw3nxpt000504lb7wuf6wfb	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.028
cmlmkdr6b001f04lfqtcbhe8f	cmkw3qm46000604lbti8qqfdy	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.107
cmlmkdr9q001g04lfduaksyi8	cmkw3v6fd000704lbf68w0nea	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.23
cmlmkdrc0001h04lf6m8qpj2r	cmkw6evmx000204k1hdx7gze4	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.312
cmlmkdren001i04lf8xdsbdq6	cmkw6r1tn000304k1uhzsiyxq	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.407
cmlmkdrgp001j04lfe5hggd11	cmkw7oj2b000004l7b9yh6g2j	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.481
cmlmkdrip001k04lfz5yip1gj	cmkw7rhl5000104l7uvxc4xia	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.553
cmlmkdrkj001l04lfcg9d9a93	cmkw7uf2y000204l7zxenioaw	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.619
cmlmkdrms001m04lfb39tjp7x	cmkw835cx000304l7mcfyzwj5	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.7
cmlmkdrou001n04lf812ch8x0	cmkw8ccco000404l74lbz0gwu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.774
cmlmkdrr3001o04lf1f763w5j	cmkw8gdy2000504l7wjglpr9p	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.855
cmlmkdrt8001p04lfq5ysub4v	cmkw8gr2m000604l760godkyi	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:09.932
cmlmkdrwm001q04lf5b5wf92z	cmkw8iqxk000704l7aijrxenl	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.054
cmlmkds8e001r04lfz0k13vhz	cmkw8tdrw000804l7fnsgmq34	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.478
cmlmkdsbe001s04lflk7e2776	cmkw9ga9z000004jj8x2a48hf	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.586
cmlmkdsdi001t04lfcq6zbbh2	cmkw9gaoi000104jj3ztuxuls	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.662
cmlmkdsfh001u04lffra6lyka	cmkw9in8x000204jjcdnumo03	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.733
cmlmkdshn001v04lfahejwjmd	cmkw9qvq6000304jj0of8ku7w	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.811
cmlmkdsjv001w04lfdipm39j3	cmkwa31tf000404jj4123tyod	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.891
cmlmkdsm8001x04lffcycqu9e	cmkwabpbd000504jjn6kc45r8	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:10.976
cmlmkdsog001y04lf76phzni1	cmkwac923000604jjqwteoy3e	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.056
cmlmkdsqy001z04lf5c0kwjw8	cmkwah7h7000704jjbkf2y8ev	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.146
cmlmkdssz002004lf1tyy20id	cmkwaivq3000804jjh74hnpnr	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.219
cmlmkdsw3002104lfvawj0400	cmkwaqass000904jju5s8vcdy	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.331
cmlmkdsz4002204lf86nhn5vd	cmkwb61ka000a04jjv9na5u38	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.44
cmlmkdt24002304lf5tvotp6z	cmkwb6u4f000b04jj6f65kcwu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.547
cmlmkdt4c002404lfd9q632vw	cmkwbddoz000c04jj41wap2ck	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.628
cmlmkdt6t002504lf30chphwh	cmkwcmugc000004l4lmibmlm3	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.717
cmlmkdt9h002604lf8ymntoae	cmkwct8j5000104l42sjsx8op	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.813
cmlmkdtbm002704lfamboakwc	cmkwcwj04000204l4fs1dz331	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.89
cmlmkdte7002804lf11lezpsg	cmkwcwnvl000304l4komyhwh9	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:11.983
cmlmkdtge002904lfpw0t7za4	cmkwd2wei000404l4uac1a118	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.062
cmlmkdtii002a04lfg0ybb7i2	cmkwd748d000504l4d05mgecv	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.138
cmlmkdtkb002b04lfvo4mii51	cmkwdz74o000604l4p2juie93	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.203
cmlmkdtm2002c04lfgwzu3kpe	cmkwdzqpt000704l43h7ultnc	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.266
cmlmkdto5002d04lfxuui1o5e	cmkwe4f6t000804l4ipjab3h7	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.341
cmlmkdtqh002e04lfcx9zppn9	cmkwe5beb000904l4jteleodz	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.425
cmlmkdttf002f04lfbro4rqtb	cmkwe9e1e000a04l4dppdkf1z	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.531
cmlmkdtvg002g04lf7z2zpf4y	cmkwee1xp000b04l4rvqxvqez	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.604
cmlmkdtxd002h04lf9qfdh4je	cmkweohyr000c04l48slgxi7d	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.673
cmlmkdtzb002i04lfmzjlw6t9	cmkwerttl000d04l4q3fw7ume	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.743
cmlmkdu1b002j04lfss2xpnn4	cmkweyd0h000e04l4054qr1d2	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.815
cmlmkdu4j002k04lf2st0su8g	cmkwf2aev000f04l4q6cklkft	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:12.931
cmlmkdu6u002l04lf8zrbbzb3	cmkwf45rc000g04l4zbzmzm5a	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.014
cmlmkdu9t002m04lfxxwvcdp9	cmkwfckpv000h04l4n7u1mhg4	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.121
cmlmkdubu002n04lff9f8uqtq	cmkx6eqso000004ihq9zmnmah	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.194
cmlmkdudy002o04lfyndnn2me	cmkx8g8qm000004jocz6qgin8	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.27
cmlmkdug8002p04lfxgkgwnmc	cmkxb63h5000004l1cf4by57x	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.352
cmlmkduix002q04lf7shnd097	cmkxddmaa000004l52tpa0k3a	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.449
cmlmkdulc002r04lfxw72wbbx	cmky71jx9000004jxq881rb15	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.536
cmlmkdunt002s04lfocbk98u6	cmlgeg4oh000004juf2uodxh3	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.625
cmlmkduq8002t04lfbbxiciqg	cmlgv6q82000004l42a3ybv8f	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.712
cmlmkdusm002u04lff7mmz2i6	cmle1beg4000004ju6ux0jcqf	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.798
cmlmkduus002v04lf0xwksupy	cmlgvgyro000004l76l5kmqly	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.876
cmlmkduwv002w04lfwxjhkr6c	cmlh2za37000004jl8byq3ypx	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:13.951
cmlmkduyv002x04lfn1m04j3f	cmlh695fh000004ju523yrmg0	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:14.023
cmlmkdv10002y04lfkdsfrgq5	cmlh6ight000004juktx7jtro	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-02-24T17:02:04.733Z", "previousExpiresAt": null}	2026-02-14 17:02:14.1
cmlmkdv2v002z04lf3zfvakyi	cmkx46go1000004jusig076ly	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2029-02-12T17:20:18.153Z", "previousExpiresAt": "2029-02-02T17:20:18.153Z"}	2026-02-14 17:02:14.167
cmlmkl9n0000004l5y3bc3xez	cmkljgxfy000404ldmogdzg1v	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:07:59.628
cmlmkl9qw000104l5eidus5bv	cmkvpi6mn000004l84y1f5cyb	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:07:59.768
cmlmklalw000204l5v9x1csqd	cmkvt1b59000004k04o4fzktc	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:00.884
cmlmklaon000304l5c6n6xx56	cmjvoz3sc000004lhtl5nnngd	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:00.983
cmlmklbky000404l53cfbv8rx	cmkw4cxkn000904lbi4xa1qkv	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:02.146
cmlmklbnd000504l5qw0gvoeu	cmkw4dukd000a04lbx7lyqbsn	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:02.232
cmlmklchw000604l5y3lixaky	cmkw4f9qh000b04lb02dneig7	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:03.332
cmlmklck9000704l522ctp86b	cmkw4hlp1000c04lbaw8qnlq0	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:03.417
cmlmkldel000804l53azby0hw	cmkw4q8a5000004l2tbf4znko	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:04.509
cmlmkldhs000904l5z6gcn2af	cmjvz9ujo000004i2otfiop2e	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:04.624
cmlmkleff000a04l57dbee83z	cmkljjb0y000504ldarypkslh	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:05.835
cmlmklei1000b04l5i5kynjo9	cmkljlo22000604ldy8dogk7a	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:05.929
cmlmklfbv000c04l5or4q4gka	cmkw4tspx000104l2uh3bz0vs	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:07.003
cmlmklff1000d04l5f1z5hqks	cmkw54r6i000004inuwk14pri	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:07.117
cmlmklg9m000e04l5div8qcwm	cmkw6ctyj000004k1eqbf884e	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:08.218
cmlmklgdj000f04l5x43ur7mp	cmkw6e7t3000104k19fwt94i6	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:08.359
cmlmklh8g000g04l5uk9ilkf8	cmkvmvtik000004kwpoc7jtpq	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:09.472
cmlmklhbi000h04l5f5td7n1g	cmkvo7d6v000004i51eoc31ek	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:09.582
cmlmkli5i000i04l588d7bx9m	cmkvo8oj5000004jmkmw21ei6	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:10.662
cmlmkli8a000j04l5qyk8jnen	cmjqd442r000104jvva1kg5ew	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:10.762
cmlmklj1x000k04l5snisqcig	cmkvpwwir000204l8l9zenhv5	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:11.829
cmlmklj4h000l04l58pgv0tpk	cmkvw3d0k000004l23ed5yvkj	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:11.921
cmlmkljyk000m04l5kum6lfg3	cmkvwgb26000104l2snz41twx	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:13.004
cmlmklk1p000n04l5ugqvnn5w	cmkvwx3im000004l8wjpnfcyu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:13.117
cmlmklkwf000o04l5xv81hhqf	cmkvy2ij9000004kzz0ffjr85	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:14.223
cmlmklkza000p04l5dz3wzylc	cmkvy7d5j000104kzzdteakr8	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:14.326
cmlmkllte000q04l5310l0foz	cmkvyhy0n000004jocvh409pg	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:15.41
cmlmkllvt000r04l5q6dqhs2a	cmkvyrqvy000004l8l2821ssg	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:15.497
cmlmklmqk000s04l5hpil7jmb	cmkvz37qw000104l8g3339log	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:16.604
cmlmklmsv000t04l5qgafqcd9	cmkvz8pwc000204l83su7tq7w	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:16.687
cmlmklnn5000u04l57e55dbic	cmkvz9jca000304l8naekwh5n	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:17.777
cmlmklnp5000v04l5mx0gdow1	cmkvzb8ba000404l8xjzrei66	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:17.849
cmlmklojp000w04l503c5vray	cmkw14u2n000004jgclqk71wm	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:18.949
cmlmklolz000x04l5a3dohnqm	cmkw1ddvv000104jgte6oqnjg	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:19.031
cmlmklpfz000y04l5j1p5ch3g	cmkw1dlo2000204jgwkq4vxwp	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:20.111
cmlmklpiu000z04l5vddf4fg9	cmkw1ftjb000304jg6o02lcz5	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:20.214
cmlmklqcy001004l57371zivc	cmkw1uou7000004l8s5bozxjy	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:21.298
cmlmklqf3001104l5esvos1m2	cmkw1zbdh000104l8r0eqa0n1	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:21.375
cmlmklr9d001204l5674zyizr	cmkw20vl9000204l8xfa6x2f1	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:22.465
cmlmklrc2001304l5c1014yuh	cmkw2kky8000004lbgatszkxm	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:22.562
cmlmkls7k001404l5vki6k2di	cmkw2q4su000104lbdk6ioyqw	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:23.696
cmlmkls9v001504l5q4x7i947	cmkw2ukrs000204lb5tvoo77g	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:23.779
cmlmklt4z001604l5dp5hm353	cmkw3dr7j000304lb7f4uyhko	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:24.899
cmlmklt7b001704l56em61ety	cmkw3jzkj000404lbhlrzf9ht	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:24.983
cmlmklu1h001804l5hr3hrq8v	cmkw3nxpt000504lb7wuf6wfb	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:26.069
cmlmklu3s001904l5gklz1duv	cmkw3qm46000604lbti8qqfdy	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:26.152
cmlmkluxo001a04l5hqvskfkt	cmkw3v6fd000704lbf68w0nea	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:27.228
cmlmklv0o001b04l5x4r0zl3t	cmkw6evmx000204k1hdx7gze4	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:27.336
cmlmklvv0001c04l5ywgzh8g3	cmkw6r1tn000304k1uhzsiyxq	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:28.428
cmlmklvxl001d04l5dq6phf1w	cmkw7oj2b000004l7b9yh6g2j	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:28.521
cmlmklwrk001e04l545eoevk0	cmkw7rhl5000104l7uvxc4xia	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:29.6
cmlmklwu7001f04l5pt5njyds	cmkw835cx000304l7mcfyzwj5	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:29.695
cmlmklxpn001g04l5comkimis	cmkw8ccco000404l74lbz0gwu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:30.827
cmlmklxsg001h04l53zrfsh27	cmkw8gdy2000504l7wjglpr9p	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:30.928
cmlmklyml001i04l5ww3z92s2	cmkw8gr2m000604l760godkyi	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:32.013
cmlmklyor001j04l5ifcfz6da	cmkw8iqxk000704l7aijrxenl	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:32.091
cmlmklzj5001k04l5lxoxx77n	cmkw3xk4n000804lb5zi2xz3z	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:33.185
cmlmklzmn001l04l58du4zgob	cmkw4iy6z000d04lb7ky2j3bu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:33.311
cmlmkm0gl001m04l5kboapgaw	cmkxb63h5000004l1cf4by57x	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:34.389
cmlmkm0j2001n04l5317xtsqq	cmkxddmaa000004l52tpa0k3a	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:34.478
cmlmkm1dg001o04l5o9szhw8o	cmky71jx9000004jxq881rb15	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:35.572
cmlmkm1jf001p04l59eeb5epo	cmlgeg4oh000004juf2uodxh3	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:35.787
cmlmkm2dm001q04l5f1v0wapl	cmkvpow9k000104l8ck2kemvi	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:36.874
cmlmkm2ga001r04l5jcyigswu	cmkw1j3du000404jgd0uznkp6	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:36.97
cmlmkm3a9001s04l5e1idmto0	cmkw7uf2y000204l7zxenioaw	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:38.049
cmlmkm3ck001t04l5z24my6gl	cmkw8tdrw000804l7fnsgmq34	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:38.132
cmlmkm478001u04l57xx759o0	cmkw9ga9z000004jj8x2a48hf	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:39.236
cmlmkm4ae001v04l5rt7z0ki7	cmkw9gaoi000104jj3ztuxuls	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:39.35
cmlmkm555001w04l5h0vh6j29	cmjqd39g4000004jvmr26agl4	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:40.457
cmlmkm58j001x04l5fs2vab09	cmkw9in8x000204jjcdnumo03	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:40.579
cmlmkm63y001y04l57l0kcijz	cmkw9qvq6000304jj0of8ku7w	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:41.71
cmlmkm66t001z04l5ecku03ns	cmkwa31tf000404jj4123tyod	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:41.813
cmlmkm70u002004l5kqd8rlni	cmkwabpbd000504jjn6kc45r8	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:42.894
cmlmkm73p002104l59sgcvs7q	cmkwac923000604jjqwteoy3e	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:42.997
cmlmkm7y8002204l56tuww6bm	cmkwah7h7000704jjbkf2y8ev	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:44.096
cmlmkm80m002304l55eb1d9yo	cmkwaivq3000804jjh74hnpnr	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:44.182
cmlmkm8v9002404l5vo18fmx9	cmkwaqass000904jju5s8vcdy	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:45.285
cmlmkm8xn002504l5pc4g4wlz	cmkwb61ka000a04jjv9na5u38	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:45.371
cmlmkm9s9002604l53rf2c3cm	cmkwb6u4f000b04jj6f65kcwu	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:46.473
cmlmkm9ut002704l50rxg0hwp	cmkwbddoz000c04jj41wap2ck	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:46.565
cmlmkmaq0002804l593xmonpk	cmkwcmugc000004l4lmibmlm3	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:47.688
cmlmkmaw4002904l5akj4l0mh	cmkwct8j5000104l42sjsx8op	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:47.908
cmlmkmbr2002a04l5yi0h3pn4	cmkwcwj04000204l4fs1dz331	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:49.022
cmlmkmbu4002b04l5peszz4m6	cmkwcwnvl000304l4komyhwh9	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:49.132
cmlmkmcoc002c04l544novmek	cmkwd2wei000404l4uac1a118	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:50.22
cmlmkmcrh002d04l5eo0rcgrs	cmkwd748d000504l4d05mgecv	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:50.333
cmlmkmdlx002e04l5j6iu78md	cmkwdz74o000604l4p2juie93	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:51.429
cmlmkmdor002f04l5zgen80qk	cmkwdzqpt000704l43h7ultnc	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:51.53
cmlmkmek5002g04l5abckekrh	cmkwe4f6t000804l4ipjab3h7	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:52.661
cmlmkmemi002h04l5qyo2jir4	cmkwe5beb000904l4jteleodz	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:52.746
cmlmkmfgj002i04l57zxwkcan	cmkwe9e1e000a04l4dppdkf1z	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:53.827
cmlmkmfiv002j04l5guwgqrsd	cmkwee1xp000b04l4rvqxvqez	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:53.911
cmlmkmgee002k04l5db7hex90	cmkweohyr000c04l48slgxi7d	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:55.046
cmlmkmghh002l04l5lyh77ubs	cmkwerttl000d04l4q3fw7ume	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:55.157
cmlmkmhc4002m04l51bb1pq09	cmkweyd0h000e04l4054qr1d2	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:56.26
cmlmkmhev002n04l5j3cf435e	cmkwf2aev000f04l4q6cklkft	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:56.359
cmlmkmi8s002o04l5rn6sekz6	cmkwf45rc000g04l4zbzmzm5a	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:57.436
cmlmkmij7002p04l5n6j65tsz	cmkwfckpv000h04l4n7u1mhg4	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:57.811
cmlmkmjhz002q04l558i5ijs6	cmkx6eqso000004ihq9zmnmah	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:59.063
cmlmkmjl8002r04l5g0cy6fmr	cmkx8g8qm000004jocz6qgin8	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:08:59.18
cmlmkmkfd002s04l5eqzr6zm9	cmlgv6q82000004l42a3ybv8f	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:09:00.265
cmlmkmkie002t04l5z7vgy58v	cmle1beg4000004ju6ux0jcqf	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:09:00.374
cmlmkmld0002u04l5genowujv	cmlgvgyro000004l76l5kmqly	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:09:01.476
cmlmkmlii002v04l58nrgnpdp	cmlh2za37000004jl8byq3ypx	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:09:01.674
cmlmkmmf9002w04l5r9olppfo	cmlh695fh000004ju523yrmg0	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:09:02.853
cmlmkmmi1002x04l53la0e6dy	cmlh6ight000004juktx7jtro	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2026-03-06T17:02:04.733Z", "previousExpiresAt": "2026-02-24T17:02:04.733Z"}	2026-02-14 17:09:02.953
cmlmkmncp002y04l50r8eczy0	cmkx46go1000004jusig076ly	subscription_extended	Free promotion: +10 days	{"source": "job_free_subscription", "daysAdded": 10, "newExpiresAt": "2029-02-22T17:20:18.153Z", "previousExpiresAt": "2029-02-12T17:20:18.153Z"}	2026-02-14 17:09:04.057
cmlyfvdb0000004l4ajweqvyg	cmkx46go1000004jusig076ly	subscription_renewed	Stripe monthly: +30 days	{"plan": "monthly", "source": "stripe", "priceId": "price_1T3n0uEwupuMwPH3PImLF7c2", "daysAdded": 30, "invoiceId": "in_1T3n1GEwupuMwPH3CvY2WZm8", "newExpiresAt": "2029-03-14T17:20:18.153Z", "subscriptionId": "sub_1T3n1IEwupuMwPH3KaMpBRsI", "previousExpiresAt": "2029-02-12T17:20:18.153Z"}	2026-02-23 00:29:06.972
cmlztx4si000104joyu26825v	cmkx46go1000004jusig076ly	referral_reward	Invite a friend: moved up 1 on waitlist + 1 day free	{"referredEmail": "adil.abbddadi.@gmail.com", "newWaitlistNumber": 233}	2026-02-23 23:50:10.05
cmm3fvy9h000104jxdmup3op3	cmm3fvebk000004jxnpelowsp	subscription_started	1 day free after email verification	{"source": "email_verification", "newExpiresAt": "2026-02-27T12:28:24.977Z", "previousExpiresAt": null}	2026-02-26 12:28:25.013
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."Session" ("id", "sessionToken", "userId", "expires") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."User" ("id", "email", "password", "name", "emailVerified", "createdAt", "updatedAt", "subscriptionExpiresAt", "waitlistNumber") FROM stdin;
cmkljgxfy000404ldmogdzg1v	adil.abbadi.@gmail.comf	$2b$10$4GKJThsHy8RNAPNs3uL1auCpvoBWwsDmXj2.R9M6A6ubD87PByPZG	adil	\N	2026-01-19 19:09:09.07	2026-02-14 17:02:05.623	2026-02-24 17:02:04.733	234
cmkvpi6mn000004l84y1f5cyb	khanyusuf2184@gmail.com	\N	Yusuf Khan	\N	2026-01-26 21:55:47.087	2026-02-14 17:02:06.579	2026-02-24 17:02:04.733	234
cmkvt1b59000004k04o4fzktc	spiceymyrn@gmail.com	\N	Myrna Daguan Pasaol	\N	2026-01-26 23:34:38.253	2026-02-14 17:02:06.78	2026-02-24 17:02:04.733	234
cmjvoz3sc000004lhtl5nnngd	mays.midbo@gmail.com	\N	M	\N	2026-01-01 17:01:14.604	2026-02-14 17:02:04.895	2026-02-24 17:02:04.733	234
cmkw4cxkn000904lbi4xa1qkv	anjimabindhu388@gmail.com	\N	anjima bindhu	\N	2026-01-27 04:51:36.311	2026-02-14 17:02:05.059	2026-02-24 17:02:04.733	234
cmkw4dukd000a04lbx7lyqbsn	mahiadhav28@gmail.com	\N	Adhavan	\N	2026-01-27 04:52:19.069	2026-02-14 17:02:05.143	2026-02-24 17:02:04.733	234
cmkw4f9qh000b04lb02dneig7	vidya.mehata18@gmail.com	\N	Vidya Mehatho	\N	2026-01-27 04:53:25.385	2026-02-14 17:02:05.227	2026-02-24 17:02:04.733	234
cmkw4hlp1000c04lbaw8qnlq0	sabrielbmw@gmail.com	\N	Muhammad Sabriel (Eriel09)	\N	2026-01-27 04:55:14.197	2026-02-14 17:02:05.3	2026-02-24 17:02:04.733	234
cmkw4q8a5000004l2tbf4znko	sunmegapowersystem@gmail.com	\N	Sun mega Power system	\N	2026-01-27 05:01:56.717	2026-02-14 17:02:05.465	2026-02-24 17:02:04.733	234
cmjvz9ujo000004i2otfiop2e	adil.sefrou@gmail.com	\N	Adil ABBADI	\N	2026-01-01 21:49:32.004	2026-02-14 17:02:05.537	2026-02-24 17:02:04.733	234
cmkljjb0y000504ldarypkslh	adil.abbadi.@gmail.comdd	$2b$10$pvV4r1uiq4YlFSH2yE4KS.7e7ygPZCZT3a2boy0Z95s6kmN5P6CE.	adil	\N	2026-01-19 19:10:59.986	2026-02-14 17:02:05.703	2026-02-24 17:02:04.733	234
cmkljlo22000604ldy8dogk7a	adil.abbadi.@gmail.comsad	$2b$10$RTBK2fSfU6846jviZkALh./lUdheuDtAT2U41IgB06ui0cO78RmBK	adil abbadi	\N	2026-01-19 19:12:50.186	2026-02-14 17:02:05.782	2026-02-24 17:02:04.733	234
cmkw4tspx000104l2uh3bz0vs	bnishanthvarma@gmail.com	\N	Nishanth	\N	2026-01-27 05:04:43.173	2026-02-14 17:02:05.859	2026-02-24 17:02:04.733	234
cmkw54r6i000004inuwk14pri	ss2905@srmist.edu.in	\N	SINDHU SANDHURI (RA2311026010048)	\N	2026-01-27 05:13:14.394	2026-02-14 17:02:05.948	2026-02-24 17:02:04.733	234
cmkw6ctyj000004k1eqbf884e	wajeehabakhat@gmail.com	\N	Wajeeha Bakhat	\N	2026-01-27 05:47:30.859	2026-02-14 17:02:06.037	2026-02-24 17:02:04.733	234
cmkw6e7t3000104k19fwt94i6	ganaksojan055@gmail.com	\N	gana k sojan	\N	2026-01-27 05:48:35.463	2026-02-14 17:02:06.113	2026-02-24 17:02:04.733	234
cmkvmvtik000004kwpoc7jtpq	sr827471@gmail.com	\N	SiNiXPiE “SiNiX”	\N	2026-01-26 20:42:24.428	2026-02-14 17:02:06.267	2026-02-24 17:02:04.733	234
cmkvo7d6v000004i51eoc31ek	samraibean@gmail.com	\N	Samrai Bean	\N	2026-01-26 21:19:22.759	2026-02-14 17:02:06.337	2026-02-24 17:02:04.733	234
cmkvo8oj5000004jmkmw21ei6	rjrahulboss007@gmail.com	\N	Raúl Roy	\N	2026-01-26 21:20:24.112	2026-02-14 17:02:06.43	2026-02-24 17:02:04.733	234
cmjqd442r000104jvva1kg5ew	adil.abbadi.@gmail.com	$2b$10$asfM3GgbUxzY3i0/x4um2.fYNYl5//JXAxBh9s59eERMKGwKksIHG	adilo	\N	2025-12-28 23:30:21.987	2026-02-14 17:02:06.501	2026-02-24 17:02:04.733	234
cmkvpwwir000204l8l9zenhv5	abdulwahhalareqi@gmail.com	\N	al abdul	\N	2026-01-26 22:07:13.827	2026-02-14 17:02:06.717	2026-02-24 17:02:04.733	234
cmkvw3d0k000004l23ed5yvkj	aujsctupasalexander@gmail.com	\N	Tupas, Alexander G.	\N	2026-01-27 01:00:12.836	2026-02-14 17:02:06.857	2026-02-24 17:02:04.733	234
cmkvwgb26000104l2snz41twx	mrs515309@gmail.com	\N	MR Surya	\N	2026-01-27 01:10:16.83	2026-02-14 17:02:06.984	2026-02-24 17:02:04.733	234
cmkvwx3im000004l8wjpnfcyu	jisnisherin7090@gmail.com	$2b$10$XKbytxpahJDcjQmZg6vnkeShV.JVJuhTxf0BmD9I19ygI5IEt6bhe	x0	\N	2026-01-27 01:23:20.206	2026-02-14 17:02:07.085	2026-02-24 17:02:04.733	234
cmkvy2ij9000004kzz0ffjr85	sandeepmv526@gmail.com	\N	s v	\N	2026-01-27 01:55:32.565	2026-02-14 17:02:07.364	2026-02-24 17:02:04.733	234
cmkvy7d5j000104kzzdteakr8	souu.keyii@gmail.com	\N	zenn	\N	2026-01-27 01:59:18.871	2026-02-14 17:02:07.436	2026-02-24 17:02:04.733	234
cmkvyhy0n000004jocvh409pg	hamidurrashid766330@gmail.com	\N	Hamidur Rashid Jamil, CSAA	\N	2026-01-27 02:07:32.471	2026-02-14 17:02:07.504	2026-02-24 17:02:04.733	234
cmkvyrqvy000004l8l2821ssg	mayborn8055@gmail.com	\N	Mayborn Mylliemngap	\N	2026-01-27 02:15:09.79	2026-02-14 17:02:07.575	2026-02-24 17:02:04.733	234
cmkvz37qw000104l8g3339log	k.saikumar11421@gmail.com	\N	sai kumar karri	\N	2026-01-27 02:24:04.856	2026-02-14 17:02:07.648	2026-02-24 17:02:04.733	234
cmkvz8pwc000204l83su7tq7w	margaretdee123@gmail.com	\N	Margaret Lianna	\N	2026-01-27 02:28:21.66	2026-02-14 17:02:07.722	2026-02-24 17:02:04.733	234
cmkvz9jca000304l8naekwh5n	jessepaulmendezpro@gmail.com	\N	JESSE PAUL MENDEZ	\N	2026-01-27 02:28:59.818	2026-02-14 17:02:07.796	2026-02-24 17:02:04.733	234
cmkvzb8ba000404l8xjzrei66	1021917782@student.wub.edu.bd	\N	MD.RABIUL HOSSEN	\N	2026-01-27 02:30:18.838	2026-02-14 17:02:07.884	2026-02-24 17:02:04.733	234
cmkw14u2n000004jgclqk71wm	abdullaashraf361@gmail.com	\N	ABDULLA ASHRAF	\N	2026-01-27 03:21:19.679	2026-02-14 17:02:07.959	2026-02-24 17:02:04.733	234
cmkw1ddvv000104jgte6oqnjg	sachingowdra55@gmail.com	$2b$10$d9hLRaV9Gep5U3a1QcKuzeBmVP7Tiidv7.bjS6RDs1WyhA1421DZm	Sachin G N	\N	2026-01-27 03:27:58.603	2026-02-14 17:02:08.041	2026-02-24 17:02:04.733	234
cmkw1dlo2000204jgwkq4vxwp	ayeshakubra80@gmail.com	\N	Ayesha Kubra	\N	2026-01-27 03:28:08.69	2026-02-14 17:02:08.123	2026-02-24 17:02:04.733	234
cmkw1ftjb000304jg6o02lcz5	hasindulksponsor@gmail.com	\N	Hasindu EX	\N	2026-01-27 03:29:52.199	2026-02-14 17:02:08.255	2026-02-24 17:02:04.733	234
cmkw1uou7000004l8s5bozxjy	pragatitambe2000@gmail.com	\N	Pragati Tambe	\N	2026-01-27 03:41:25.951	2026-02-14 17:02:08.396	2026-02-24 17:02:04.733	234
cmkw1zbdh000104l8r0eqa0n1	abhinavpanicker007@gmail.com	$2b$10$QObP1Eid0DKDDmsQxnl9FuddOyShb/FEKML6YKWrF1znPQjeojS0C	\N	\N	2026-01-27 03:45:01.781	2026-02-14 17:02:08.478	2026-02-24 17:02:04.733	234
cmkw20vl9000204l8xfa6x2f1	banerjeeganesh44@gmail.com	\N	Ganesh Banerjee	\N	2026-01-27 03:46:14.637	2026-02-14 17:02:08.544	2026-02-24 17:02:04.733	234
cmkw2kky8000004lbgatszkxm	kiranjyotidutta33@gmail.com	\N	Kiran Dutta	\N	2026-01-27 04:01:33.968	2026-02-14 17:02:08.619	2026-02-24 17:02:04.733	234
cmkw2q4su000104lbdk6ioyqw	dilfahakeem011@gmail.com	\N	Dilfa Hakeem	\N	2026-01-27 04:05:52.973	2026-02-14 17:02:08.706	2026-02-24 17:02:04.733	234
cmkw2ukrs000204lb5tvoo77g	ecitomartin@gmail.com	\N	Ecito Basil Martin V.	\N	2026-01-27 04:09:20.296	2026-02-14 17:02:08.776	2026-02-24 17:02:04.733	234
cmkw3dr7j000304lb7f4uyhko	guravvinayak037@gmail.com	\N	Vinayak Gurav	\N	2026-01-27 04:24:15.103	2026-02-14 17:02:08.844	2026-02-24 17:02:04.733	234
cmkw3jzkj000404lbhlrzf9ht	haydot10@gmail.com	$2b$10$521GOULrt.mxhWFMtF6j2uGPAi2GZ4eRpt7walgw9tU6O6l2RETKe	\N	\N	2026-01-27 04:29:05.875	2026-02-14 17:02:08.933	2026-02-24 17:02:04.733	234
cmkw3nxpt000504lb7wuf6wfb	tandamata369@gmail.com	\N	Tanda Mata	\N	2026-01-27 04:32:10.097	2026-02-14 17:02:09.027	2026-02-24 17:02:04.733	234
cmkw3qm46000604lbti8qqfdy	kattablesson125@gmail.com	\N	Srikanth Katta	\N	2026-01-27 04:34:15.03	2026-02-14 17:02:09.105	2026-02-24 17:02:04.733	234
cmkw3v6fd000704lbf68w0nea	basantkumarrealme9166@gmail.com	\N	BasantKumar Basant	\N	2026-01-27 04:37:47.977	2026-02-14 17:02:09.228	2026-02-24 17:02:04.733	234
cmkw6evmx000204k1hdx7gze4	rogstrixasus80@gmail.com	\N	ASUS Rog Strix	\N	2026-01-27 05:49:06.345	2026-02-14 17:02:09.31	2026-02-24 17:02:04.733	234
cmkw6r1tn000304k1uhzsiyxq	satyanarayana.chintha218@gmail.com	\N	Satyanarayana Chintha	\N	2026-01-27 05:58:34.235	2026-02-14 17:02:09.405	2026-02-24 17:02:04.733	234
cmkw7oj2b000004l7b9yh6g2j	shahivawana61@gmail.com	\N	Bhawana rl shahi	\N	2026-01-27 06:24:36.227	2026-02-14 17:02:09.48	2026-02-24 17:02:04.733	234
cmkw7rhl5000104l7uvxc4xia	deepankarraj794@gmail.com	\N	HARSH KUMAR	\N	2026-01-27 06:26:54.281	2026-02-14 17:02:09.551	2026-02-24 17:02:04.733	234
cmkw835cx000304l7mcfyzwj5	soniassarathy23@gmail.com	\N	Sonia R	\N	2026-01-27 06:35:58.305	2026-02-14 17:02:09.698	2026-02-24 17:02:04.733	234
cmkw8ccco000404l74lbz0gwu	bw305492@gmail.com	\N	Bridget Wambui	\N	2026-01-27 06:43:07.272	2026-02-14 17:02:09.773	2026-02-24 17:02:04.733	234
cmkw8gdy2000504l7wjglpr9p	121hafizalimir@gmail.com	\N	Al Hussaini	\N	2026-01-27 06:46:15.962	2026-02-14 17:02:09.853	2026-02-24 17:02:04.733	234
cmkw8gr2m000604l760godkyi	thedhritimoyee@gmail.com	\N	Dhriti moyee Kalita	\N	2026-01-27 06:46:32.974	2026-02-14 17:02:09.93	2026-02-24 17:02:04.733	234
cmkw8iqxk000704l7aijrxenl	udayappu22@gmail.com	\N	Uday Sankartc	\N	2026-01-27 06:48:06.104	2026-02-14 17:02:10.053	2026-02-24 17:02:04.733	234
cmkw3xk4n000804lb5zi2xz3z	canikisuhh@gmail.com	\N	Can i Kiss you	\N	2026-01-27 04:39:39.047	2026-02-14 17:02:04.984	2026-02-24 17:02:04.733	234
cmkw4iy6z000d04lb7ky2j3bu	pintukryadav47@gmail.com	$2b$10$FS2Sll2R/GFRySSNoCFZBeD0XH6NTMVsPysI6iCtG55xgjvdug3xW	Pintu Yadav	\N	2026-01-27 04:56:17.051	2026-02-14 17:02:05.393	2026-02-24 17:02:04.733	234
cmkxb63h5000004l1cf4by57x	gggordo2@gmail.com	\N	Gail Gordon	\N	2026-01-28 00:50:00.856	2026-02-14 17:02:13.35	2026-02-24 17:02:04.733	234
cmkxddmaa000004l52tpa0k3a	oslm1516@gmail.com	\N	oscar LM	\N	2026-01-28 01:51:51.058	2026-02-14 17:02:13.448	2026-02-24 17:02:04.733	234
cmky71jx9000004jxq881rb15	wsullivan1987@gmail.com	$2b$10$IqjWPBoUGanxN5AVeXztzOkW6xsCkDET6KjNw8RZNCieoGriz7YGC	William Sullivan	\N	2026-01-28 15:42:16.605	2026-02-14 17:02:13.534	2026-02-24 17:02:04.733	234
cmlgeg4oh000004juf2uodxh3	achimbe@aol.com	\N	Joachim Berends	\N	2026-02-10 09:29:25.169	2026-02-14 17:02:13.624	2026-02-24 17:02:04.733	234
cmkvpow9k000104l8ck2kemvi	maushetatenda10@gmail.com	$2b$10$dED0R1mc5mPw40Fpad.SUeSdeQ.qzaPQ7rQe7nBRGqrrv/nP0U/OO	Tatenda	\N	2026-01-26 22:01:00.248	2026-02-14 17:02:06.642	2026-02-24 17:02:04.733	234
cmkw1j3du000404jgd0uznkp6	appalaraju86@gmail.com	$2b$10$SzZZFalrY6BvrKPVMOJ4AOVEQqST6LAhXLAHOUnLN8lxJ/yBqo3u2	\N	\N	2026-01-27 03:32:24.929	2026-02-14 17:02:08.324	2026-02-24 17:02:04.733	234
cmkw7uf2y000204l7zxenioaw	thara3596@gmail.com	$2b$10$Lbb0yPH2YLLdW6SAtoPJQu.yfCZ6X7bkLmFPvflGWEhMN9i./jCNC	Varsha	\N	2026-01-27 06:29:11.002	2026-02-14 17:02:09.617	2026-02-24 17:02:04.733	234
cmkw8tdrw000804l7fnsgmq34	bobademanjiri@gmail.com	$2b$10$Fq0o4ymyiNyTCseUQOsKAOzoRN57KAZSRl/VS0AtKqTkANO49yfoq	Dr Manjiri	\N	2026-01-27 06:56:22.268	2026-02-14 17:02:10.477	2026-02-24 17:02:04.733	234
cmkw9ga9z000004jj8x2a48hf	goldenautomation123@gmail.com	\N	Mehrajuddin Shaikh	\N	2026-01-27 07:14:10.823	2026-02-14 17:02:10.585	2026-02-24 17:02:04.733	234
cmkw9gaoi000104jj3ztuxuls	ap014431@gmail.com	$2b$10$kv5pJGB5/Lr7gbIxWnQfrOCReam7igEQClwsxX1P0iDnztURP8DtS	Ggggggggggg	\N	2026-01-27 07:14:11.346	2026-02-14 17:02:10.66	2026-02-24 17:02:04.733	234
cmm3fh5ac000004ktjxjjeax9	adiladilsefrou@gmail.com	$2b$10$tu47f7ilFkIyLO7D./4ojeoTvY99h2rzGsO/oKE2ankjbwGRijl5e	test	\N	2026-02-26 12:16:54.276	2026-02-26 12:16:54.276	\N	236
cmjqd39g4000004jvmr26agl4	adil.abbadi@edu.uiz.ac.ma	\N	ADIL ABBADI	\N	2025-12-28 23:29:42.292	2026-02-14 17:02:04.762	2026-02-24 17:02:04.733	234
cmkw9in8x000204jjcdnumo03	haniyapydala5@gmail.com	\N	Haniya Pydala	\N	2026-01-27 07:16:00.945	2026-02-14 17:02:10.732	2026-02-24 17:02:04.733	234
cmkw9qvq6000304jj0of8ku7w	jbiden@gmail.com	$2b$10$Qa5fpAGnVR3nIuEooUkZ3OLbxDsC1Vv7bFl196KkqxF2J79VBbylG	\N	\N	2026-01-27 07:22:25.182	2026-02-14 17:02:10.809	2026-02-24 17:02:04.733	234
cmkwa31tf000404jj4123tyod	suryakantsinghchoudhary994@gmail.com	\N	Suryakant Singh chaudhary	\N	2026-01-27 07:31:52.947	2026-02-14 17:02:10.89	2026-02-24 17:02:04.733	234
cmkwabpbd000504jjn6kc45r8	ndichubenson75@gmail.com	$2b$10$yTsPyiCeIlXkQelqi0ob2.slA63ywrKDd2Yrc3h060rBoSXWZPEY2	Benson Ndichu Munyua	\N	2026-01-27 07:38:36.649	2026-02-14 17:02:10.975	2026-02-24 17:02:04.733	234
cmkwac923000604jjqwteoy3e	subhashiniganesan27@gmail.com	\N	Subhashini	\N	2026-01-27 07:39:02.235	2026-02-14 17:02:11.054	2026-02-24 17:02:04.733	234
cmkwah7h7000704jjbkf2y8ev	manasism1999@gmail.com	\N	Manasi Manchekar	\N	2026-01-27 07:42:53.467	2026-02-14 17:02:11.144	2026-02-24 17:02:04.733	234
cmkwaivq3000804jjh74hnpnr	aniketgautam8650@gmail.com	\N	Life Is Short	\N	2026-01-27 07:44:11.546	2026-02-14 17:02:11.218	2026-02-24 17:02:04.733	234
cmkwaqass000904jju5s8vcdy	jksco.chandigarh@gmail.com	\N	JKSCO Chandigarh	\N	2026-01-27 07:49:57.676	2026-02-14 17:02:11.329	2026-02-24 17:02:04.733	234
cmkwb61ka000a04jjv9na5u38	darshpatel7144@gmail.com	\N	Darsh Patel	\N	2026-01-27 08:02:12.202	2026-02-14 17:02:11.438	2026-02-24 17:02:04.733	234
cmkwb6u4f000b04jj6f65kcwu	192519026.simats@saveetha.com	\N	MAHROOS SALIH M	\N	2026-01-27 08:02:49.215	2026-02-14 17:02:11.546	2026-02-24 17:02:04.733	234
cmkwbddoz000c04jj41wap2ck	pv6989393@gmail.com	\N	Palak Verma	\N	2026-01-27 08:07:54.515	2026-02-14 17:02:11.626	2026-02-24 17:02:04.733	234
cmkwcmugc000004l4lmibmlm3	geminiiiiii546@gmail.com	\N	Gemini	\N	2026-01-27 08:43:15.756	2026-02-14 17:02:11.714	2026-02-24 17:02:04.733	234
cmkwct8j5000104l42sjsx8op	manimukta412@gmail.com	\N	Oinam Manimukta	\N	2026-01-27 08:48:13.937	2026-02-14 17:02:11.811	2026-02-24 17:02:04.733	234
cmkwcwj04000204l4fs1dz331	diplomasiwarkop.id@gmail.com	\N	Wasit Cadangan	\N	2026-01-27 08:50:47.476	2026-02-14 17:02:11.887	2026-02-24 17:02:04.733	234
cmkwcwnvl000304l4komyhwh9	sintayehu.s1983@gmail.com	$2b$10$AW3TzsL2HiQkzPenEaNfDeP1PIuGQTF4E3DEk3ssovVi1iUj7/fge	Sintayehu	\N	2026-01-27 08:50:53.793	2026-02-14 17:02:11.976	2026-02-24 17:02:04.733	234
cmkwd2wei000404l4uac1a118	yosoco4314@1200b.com	$2b$10$PeV5LgxF03J3s6A9kbex7O/s1XSZsJa5k1VIjPqX3UyapVsU6HR/.	Deko	\N	2026-01-27 08:55:44.777	2026-02-14 17:02:12.061	2026-02-24 17:02:04.733	234
cmkwd748d000504l4d05mgecv	fazochaa@gmail.com	$2b$10$plHNTOER8tj8panlCYijseQLjADHhVFyoBmyENjyvaf1drEVRvZLi	V	\N	2026-01-27 08:59:01.549	2026-02-14 17:02:12.135	2026-02-24 17:02:04.733	234
cmkwdz74o000604l4p2juie93	barmandeb161@gmail.com	$2b$10$GT0aOTUAp7UaIv/sz/hdgeYIr5TY7o/vum6mjrsW8W3AUqaL8HA/m	Deb Barman	\N	2026-01-27 09:20:51.672	2026-02-14 17:02:12.201	2026-02-24 17:02:04.733	234
cmkwdzqpt000704l43h7ultnc	vanik0872@gmail.com	\N	Vani K	\N	2026-01-27 09:21:17.057	2026-02-14 17:02:12.265	2026-02-24 17:02:04.733	234
cmkwe4f6t000804l4ipjab3h7	florentineuwawe@gmail.com	\N	Florentine Uwawe	\N	2026-01-27 09:24:55.397	2026-02-14 17:02:12.34	2026-02-24 17:02:04.733	234
cmkwe5beb000904l4jteleodz	alihaider9093a@gmail.com	\N	MuhammadAkhtar AliHaider	\N	2026-01-27 09:25:37.139	2026-02-14 17:02:12.423	2026-02-24 17:02:04.733	234
cmkwe9e1e000a04l4dppdkf1z	franhabineza1994@gmail.com	$2b$10$bd9DIKEnb32jsn3C1dabteskA3fPUEqkFbtMQo7kjtYVJzqHrNX0a	Habineza	\N	2026-01-27 09:28:47.186	2026-02-14 17:02:12.529	2026-02-24 17:02:04.733	234
cmkwee1xp000b04l4rvqxvqez	jhthasariya007@gmail.com	$2b$10$f2dC8m0PJYUFs8xU1VQmY.Bgyk7PfYlSDcTveVYmgZigU6du2SQOW	Jabir thasariya	\N	2026-01-27 09:32:24.781	2026-02-14 17:02:12.602	2026-02-24 17:02:04.733	234
cmkweohyr000c04l48slgxi7d	chika.nadila24@gmail.com	\N	Ckayna 24	\N	2026-01-27 09:40:32.115	2026-02-14 17:02:12.671	2026-02-24 17:02:04.733	234
cmkwerttl000d04l4q3fw7ume	vyshnavcravi333@gmail.com	\N	Vyshnav CR	\N	2026-01-27 09:43:07.449	2026-02-14 17:02:12.742	2026-02-24 17:02:04.733	234
cmkweyd0h000e04l4054qr1d2	godfrey.spears@gmail.com	\N	Godfrey Tamiriraishe Mapfumo	\N	2026-01-27 09:48:12.257	2026-02-14 17:02:12.813	2026-02-24 17:02:04.733	234
cmkwf2aev000f04l4q6cklkft	rifakath341@gmail.com	\N	Md.Rifakath Ali	\N	2026-01-27 09:51:15.511	2026-02-14 17:02:12.929	2026-02-24 17:02:04.733	234
cmkwf45rc000g04l4zbzmzm5a	ddanababiest@gmail.com	\N	Ddana Yoon	\N	2026-01-27 09:52:42.792	2026-02-14 17:02:13.013	2026-02-24 17:02:04.733	234
cmkwfckpv000h04l4n7u1mhg4	linnlathtain23@gmail.com	\N	Linn Lat Htain	\N	2026-01-27 09:59:15.427	2026-02-14 17:02:13.12	2026-02-24 17:02:04.733	234
cmkx6eqso000004ihq9zmnmah	jacob.carrolldmd@gmail.com	\N	Jacob Carroll	\N	2026-01-27 22:36:46.248	2026-02-14 17:02:13.192	2026-02-24 17:02:04.733	234
cmkx8g8qm000004jocz6qgin8	signpdf.0xs9b@aleeas.com	$2b$10$tQdQVLGWCS5QxU2umAkHuOaQE.1pXPzu5yFoeV3Wuj86EPFMc0Yn6	Edo	\N	2026-01-27 23:33:55.39	2026-02-14 17:02:13.268	2026-02-24 17:02:04.733	234
cmlgv6q82000004l42a3ybv8f	nigm.2000777@gmail.com	\N	Nigm Abdo	\N	2026-02-10 17:18:00.002	2026-02-14 17:02:13.711	2026-02-24 17:02:04.733	234
cmle1beg4000004ju6ux0jcqf	adil.abbadi.1997@gmail.com	$2b$10$Y.3loxKYv2ztYm/1FWjy5OokFroGofKXhVHFxpjbbypSEGnEQZmmS	adi	\N	2026-02-08 17:46:17.188	2026-02-14 17:02:13.796	2026-02-24 17:02:04.733	234
cmlgvgyro000004l76l5kmqly	tiiztremblay@gmail.com	$2b$10$Q84rEg1hSlM7V4o1fLgZNO7e8LDf419wGOiaTtMaeC9hABrbhxsNm	Tre	\N	2026-02-10 17:25:57.636	2026-02-14 17:02:13.874	2026-02-24 17:02:04.733	234
cmlh2za37000004jl8byq3ypx	lcorunahernandez@gmail.com	\N	Liam Coruña Hernández	\N	2026-02-10 20:56:09.427	2026-02-14 17:02:13.949	2026-02-24 17:02:04.733	234
cmlh695fh000004ju523yrmg0	legraphicshop@gmail.com	\N	Pere Sánchez Granados	\N	2026-02-10 22:27:48.797	2026-02-14 17:02:14.021	2026-02-24 17:02:04.733	234
cmlh6ight000004juktx7jtro	rbercovici@hudsoncollege.ca	\N	Rafaela Bercovici	\N	2026-02-10 22:35:03.041	2026-02-14 17:02:14.098	2026-02-24 17:02:04.733	234
cmlztx4ru000004joxt64rcov	adil.abbddadi.@gmail.com	$2b$10$Z5nLxzTJQEEusAbiyMCLKutze4KogbWS83yi5GZpG18j/rp5daAT.	asdf	\N	2026-02-23 23:50:10.026	2026-02-23 23:50:10.026	\N	235
cmm3fi32d000104kts26rgk5s	adiladilsefrou@hotmail.com	$2b$10$m/1eU1hd/Tiid1Cv1oySROEBKpOlThigUsfdw4JdaI245vgXLrADi	test12	\N	2026-02-26 12:17:38.053	2026-02-26 12:17:38.053	\N	237
cmm3fvebk000004jxnpelowsp	poyawex216@creteanu.com	$2b$10$Vxz45MFNsMRTSNQPBnJ/p.AIm6DYebuR6K18jXUBsI1dJpA0xOU3i	poyawex216@creteanu.com	2026-02-26 12:28:24.977	2026-02-26 12:27:59.168	2026-02-26 12:28:25.011	2026-02-27 12:28:24.977	238
cmm5677w0000004ic4ccfgdvx	gusteskarbaliute@gmail.com	$2b$10$6oRNao27a1IayXXw86JnSOA8bf/QliKQccYRJrtOsbquSNQQOzQ3m	Guste Skarbaliute	\N	2026-02-27 17:32:46.896	2026-02-27 17:32:46.896	\N	239
cmm5c2jhm000004i0rn5qlv9m	ronaldabreulopez6@gmail.com	$2b$10$IQryklv4NLjNxRIkZpumiep6whR5Kb327vM96zBBQfxNKDKF8HRTe	Ronald	\N	2026-02-27 20:17:06.346	2026-02-27 20:17:06.346	\N	240
cmm5pszpo000004iiryqqoso5	svillari12@gmail.com	\N	Santino Villari	2026-02-28 02:41:35.42	2026-02-28 02:41:35.436	2026-02-28 02:41:35.436	2026-03-01 02:41:35.42	241
cmm5zitcu000004k1p5fa4z7m	sikikmerve52@gmail.com	\N	Merve Sikik	2026-02-28 07:13:36.783	2026-02-28 07:13:36.798	2026-02-28 07:13:36.798	2026-03-01 07:13:36.783	242
cmm63bz4c000004jow3lrkhgc	kristiandoss@yahoo.com	$2b$10$iXHkyqqNZ.mjCE9es0DRZOCxDH5vHw49nTZfbZcjlod/dZ/I1S0Ee	Kristian Doss	\N	2026-02-28 09:00:16.14	2026-02-28 09:00:16.14	\N	243
cmmfrmfx1000004l40m5xapka	musasulaiman9294@gmail.com	\N	musa sulaiman	2026-03-07 03:30:10.82	2026-03-07 03:30:10.837	2026-03-07 03:30:10.837	2026-03-08 03:30:10.82	244
cmnd13kyh000004l8cnpib4ak	brianlove2121@gmail.com	\N	Brian Love	2026-03-30 10:11:50.831	2026-03-30 10:11:50.873	2026-03-30 10:11:50.873	2026-03-31 10:11:50.831	245
cmndaw1s9000004jmvpm2q523	beckneedsit@gmail.com	\N	becky	2026-03-30 14:45:55.573	2026-03-30 14:45:55.593	2026-03-30 14:45:55.593	2026-03-31 14:45:55.573	246
cmndn9h1i000004kzlgzvuzdd	rolieuniyirinda23@gmail.com	\N	Rolieu Niyirinda	2026-03-30 20:32:17.269	2026-03-30 20:32:17.286	2026-03-30 20:32:17.286	2026-03-31 20:32:17.269	247
cmkx46go1000004jusig076ly	adil.abbadi.1996@gmail.com	\N	milo kilo	\N	2026-01-27 21:34:20.641	2026-02-23 23:50:10.048	2029-03-15 17:20:18.153	233
cmnmoh9wu000004kzggfly0d3	zakysyko@denipl.net	$2b$10$wEBO6CwtsT1JKKa5PUpqIukLt/yF1PgzkbN.NPAlpfOem1uBDQDwS	jimmy	\N	2026-04-06 04:16:16.494	2026-04-06 04:16:16.494	2026-04-07 04:16:16.477	248
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."VerificationToken" ("identifier", "token", "expires") FROM stdin;
adil.abbddadi.@gmail.com	91076cb9f7f7ff1a04b966d46409adda221e746d6a6a521925396ec6cf6f5c36	2026-02-24 23:50:10.057
adiladilsefrou@gmail.com	312f92aa7f3fc0900bee7feeb56bca26170ea17e89853ff7ece4493d1c12e019	2026-02-27 12:16:54.282
adiladilsefrou@hotmail.com	ab65e68895efbf9584ca313266b049aafa0233e44f37eeb7d16af86ee1c6d845	2026-02-27 12:17:38.056
gusteskarbaliute@gmail.com	3a3b5ee24946d938c0804c1f8976f61b2ab94f7a3509dd02a23267d09b360036	2026-02-28 17:32:46.901
ronaldabreulopez6@gmail.com	6299e1293f4c30cf98192832b86b28cac98f50fcfee339000dd1b1cea2fbd634	2026-02-28 20:17:06.349
kristiandoss@yahoo.com	0ae9e3e859e7d2f174d6291eb7dc15bf2bc5fe998214b58a0bccd3a48cc67427	2026-03-01 09:00:16.144
zakysyko@denipl.net	ba708f0b4b8f7e9ae73e06c9bbb3fb6659adf1f6ed8fa841b10c5dbbe5212cfb	2026-04-07 04:16:16.499
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") FROM stdin;
e14f3f77-20ba-4963-ad0a-fcb1cb34bb67	6f3e5841c4eb795087c5c377a0f299011b04130bffaf51fb3255e12c61894a8a	2025-12-27 01:54:37.206908+00	20251226231510_init	\N	\N	2025-12-27 01:54:37.145504+00	1
a0e49fb9-311d-4071-993d-aff94cd977d9	df8bb101ecca58d7c5442bded3bfa916e6eccaba9c6dc835a23ecc9453ad2bdc	2025-12-27 01:56:57.773916+00	20251227014731_add_colors	\N	\N	2025-12-27 01:56:57.763351+00	1
ccbbb4dc-355c-4ee7-9972-3f8b35c64877	9cb51e0b7636fa960d2bd9f801893d4151f9fbecb6d7514cfd9cd8926b70ca3d	2025-12-28 23:20:36.849653+00	20251228230814_make_password_optional	\N	\N	2025-12-28 23:20:36.838763+00	1
c7804e58-bed9-4bcd-9e6a-1ff22f69ed32	fe0afdea329fb07e513716ee8388b5e4f6b3941a30de671339b7ccfd205de2a4	2026-01-19 18:40:34.553855+00	20260119151252_add_balance_to_user	\N	\N	2026-01-19 18:40:34.525289+00	1
95ead39e-483d-4079-acaf-d392db5c2c75	ecdea97eff4a215400d2a5acd68cebae290b0c2cbada949a6aad6204e93fa77d	2026-01-19 18:40:34.589298+00	20260119153130_add_license_key_model	\N	\N	2026-01-19 18:40:34.556399+00	1
90cf4f6e-e3f6-440d-b773-0307554aa508	b2caeddf9189e535ce9b0305887b3bb6a3405dadc364dea18d13ef0a1ca8b5bf	2026-01-19 18:40:34.600239+00	20260119160000_rename_balance_to_tokens	\N	\N	2026-01-19 18:40:34.591884+00	1
632f6bff-ff63-436d-9aea-8ec07bf37210	0e279da843319aa5b6ca7b067dad6f8e6d1b4f0e135460936c0e8ef1c97c8cfc	2026-01-19 18:40:34.625829+00	20260119170000_add_transaction_model	\N	\N	2026-01-19 18:40:34.602494+00	1
8b91500a-55c2-488d-9c25-d06bfb6ce203	5b0e59f703022e8768985dc3f9c3a8c9ae15cceadb1bc6ee11aa034813da03ac	2026-02-08 17:13:39.101681+00	20260131000000_subscription_and_history	\N	\N	2026-02-08 17:13:39.071272+00	1
8d1d32f7-ceea-4b81-a7cd-b2de5587d2cf	727ab747fb272fcfe223df2e3f8f07c9440f83bcc1295c86230908bd39bb15bb	2026-02-08 17:13:39.112419+00	20260131000001_remove_license_key	\N	\N	2026-02-08 17:13:39.104196+00	1
89bf4e68-2e2f-4904-b6d8-616819706421	f45f0f31a930fb6d4189c864dcc0895798ef7780f91fbc5a874babefdee534c6	2026-02-23 23:48:18.540625+00	20260131120000_add_waitlist_number	\N	\N	2026-02-23 23:48:18.528953+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");


--
-- Name: History History_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."History"
    ADD CONSTRAINT "History_pkey" PRIMARY KEY ("id");


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account" USING "btree" ("provider", "providerAccountId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session" USING "btree" ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING "btree" ("email");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken" USING "btree" ("identifier", "token");


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken" USING "btree" ("token");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: History History_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."History"
    ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict pw9exCyYlm2lA7wEQxGzn4uJ21fIt3gB9AWiDkg4C5xzRnLrdJhm6qdRtSrwloy

