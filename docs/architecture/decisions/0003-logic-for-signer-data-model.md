# 1. ADR title Logic for Signer Data Model

Authors: Danilo Spinelli & Filippo Tenaglia

Date: 2022-05-23

## Status

Draft

##Glossary

SIGNER: the IO user who uses the signature services;
QTSP: provider that places a qualified electronic signature on documents;
TOS: Terms Of Service specific to a QTSP.

##Logical model

Before being able to proceed in the flow of signing documents the SIGNER is required to accept specific TOS.

In order to verify that the SIGNER has actually signed the TOS it is necessary to keep the list of those accepted by him accompanied by the information necessary to be able to ratify their validity (eg if they have an expiry date).

TOS may be valid within a certain period of time and only for a specific QTSP.

The identifier of the QTSP used for the signature flow is set during the configuration phase (eg through an environment variable).

The data model must make it possible to verify at any time that the SIGNER was able to affix a signature only because the necessary TOS had already been accepted. The business logic that manages the signing process will check this before starting the flow.

Accepted TOS contain the identifier of the QTSP to which they refer. In this way it is possible to programmatically verify that they refer to the QTSP currently set in the configuration phase.

##Open points
be invalidated or if, alternatively, the TOS have a time duration (expire) that keeps them valid regardless of the fact that new ones are configured.
mustunderstand if the expire date is static (fixed) or depends on the time when the ToS have been accepted
We do not know if the TOS will be provided via an API from the QTSP or will be statically configured
We do not know if the email must be retrieved from the User registry or an ad hoc service to be queried via tax code

##Structure of the entities involved

###Configuration (static)
Identifier of the QTSP currently used

###ToS ToS
identifier (Pk)

QTSP identifier

Date of expiration?
(only if it is static)

Duration in seconds?
(only if the expire date is not static)

IsValid
(boolean that indicates whether the specific ToS are valid or not for the current QTSP)

###Signer
Identifier (Pk)
(obtained from the tokenizer of the Personal data vault) P
Ersonal data
Stored in the User registry?

Email
From IO user profile or User registry?

###Accepted ToS
Signer identifier (Pk)

Date of acceptance

identifier
