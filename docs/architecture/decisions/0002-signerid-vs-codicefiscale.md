#[ADR-0002] Signer ID VS Codice Fiscale

## Date: 2022-04-26

## State Proposto

##Context

We need an unique identifier to retrieve all operations saved on DB linked to a single SIGNER.

# Decision

## Option 1

We can use a UID linked only to our service

###PRO:
* the possibility to change the UID if the QTSP should change;
* the possibility to change the UID if should change the clauses linked to the sign service;
* the possibility to manage in a simple manner the changement of the generic UID (at this moment the Fiscal Code but we can't be sure that it will not change).

###CONTRO:
* the creation of a specific API to cross the generic UID with the Sign With IO's UID;
* a major difficult to integrate all data linked to an USER if will be a relation one to many between USER and SIGNER..

## Option 2

We Can use the Fiscal Code of the SIGNER

###PRO:
* We can retrivie the User Profile directly without a third call to define which is the Fiscal Code (it is true now but could be not tru in the future).

###CONTRO:
* It will be very hard manage a correct archive to retrieve all operations done by the same USER if the UID should change.

# Decision

#Solution

#UX

#Scalability

#Authonomy

#Adattability

#Security

#Semplicity




In the context of <use case/user story>, resolving the problem <problem> we decided <chosen option> and discarded <other option>, to retrieve <quality params / requirements meet>, we accepted that <disadvantages>, because <reasons>.

Consequences

Describe the consequences of the decision