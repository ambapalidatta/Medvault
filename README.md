# MedVault – Smart Medical Appointment & Record Management Platform

MedVault is a full-stack healthcare web application designed for secure medical appointment scheduling, patient record management, doctor interactions, emergency healthcare support, and AI chatbot assistance.

It provides an end-to-end digital healthcare experience with authentication, appointments, prescriptions, medical history tracking, and intelligent chatbot support.

---

## Features

### Patient Module

- Patient registration & login
- Secure authentication with JWT
- Book doctor appointments
- View appointment history
- Upload and manage medical records
- Access prescriptions and medications
- Emergency healthcare request support
- Profile management

### Doctor Module

- Doctor registration & login
- View scheduled appointments
- Manage patient records
- Add prescriptions
- Update consultation details
- View patient medical history

### Admin Module

- Admin dashboard access
- Manage patients
- Manage doctors
- Monitor appointments
- System management controls

### AI Chatbot

Integrated intelligent healthcare chatbot with:

- Medical assistance chat
- Appointment-related help
- Health guidance support
- FastAPI backend integration

### Security

- JWT authentication
- Role-based access control
- Protected API endpoints
- Secure backend architecture

---

## Tech Stack

### Frontend

- React.js
- Vite
- HTML5
- CSS3
- JavaScript
- Axios
- React Router DOM

### Backend

- Spring Boot
- Java
- Spring Security
- JWT Authentication
- Hibernate / JPA
- Maven

### Database

- MySQL

### AI Chatbot Service

- FastAPI
- Python
- Uvicorn

---

## Project Structure

```bash
MedVault/
│
├── MedVault-frontend/         # React frontend
│
├── MedVal/                    # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│
├── chatbot/
│   ├── chatbot_service/
│   ├── requirements.txt
│
└── README.md
```
