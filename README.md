# Bilitioo - Complete Ticket Reservation System

A full-stack ticket reservation system built with React frontend and Go backend, containerized with Docker for easy deployment and development.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system
- Make utility installed
- Git for cloning repositories

### One-Command Setup

**Run the complete setup**:
```bash
make all
```

This single command will:
- Download the backend dependency (`bilitioo-backend`)
- Run the backend's Makefile to set up all backend services
- Build the frontend Docker image
- Start the frontend container

## 🏗️ System Architecture

The Bilitioo system consists of multiple containerized services working together:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (Go/Gin)      │◄──►│   Database      │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │     Redis       │    │  Elasticsearch  │
         │              │    (Cache)      │    │   (Search)      │
         │              │   Port: 6379    │    │   Port: 9200    │
         └──────────────┴─────────────────┘    └─────────────────┘
                                 │
                        ┌─────────────────┐    ┌─────────────────┐
                        │     Kibana      │    │    pgAdmin      │
                        │   (Analytics)   │    │  (DB Admin)     │
                        │   Port: 5601    │    │   Port: 5050    │
                        └─────────────────┘    └─────────────────┘
```

## 🐳 Dockerization Explained

### Frontend Containerization

The frontend uses a **multi-stage Docker build** for optimal production deployment:

#### Stage 1: Builder (Development Dependencies)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
RUN npm install react-router-dom axios
COPY frontend/ ./
RUN npm run build
```

- **Base Image**: `node:18-alpine` - Lightweight Linux with Node.js 18
- **Purpose**: Install dependencies and build the React application
- **Output**: Optimized static files in `/app/build`

#### Stage 2: Production Server (Nginx)
```dockerfile
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- **Base Image**: `nginx:stable-alpine` - Lightweight web server
- **Purpose**: Serve the built React application
- **Benefits**: 
  - Smaller final image size (no Node.js runtime needed)
  - Better performance with Nginx
  - Production-ready web server

#### Frontend Docker Compose Configuration
```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: bilitioo_frontend
    ports:
      - "3001:80"  # Maps host port 3001 to container port 80
    restart: unless-stopped
```

### Backend Containerization

The backend uses a **single-stage build** with Go:

```dockerfile
FROM golang:1.23-alpine

# Install system dependencies
RUN apk add --no-cache curl git build-base

WORKDIR /app

# Download Go dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main main.go

# Install database migration tool
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz
RUN mv migrate /usr/bin/migrate

# Make scripts executable
RUN chmod +x /app/wait-for.sh
RUN chmod +x /app/start.sh

EXPOSE 3000
ENTRYPOINT ["/app/start.sh"]
CMD [ "/app/main" ]
```

**Key Features:**
- **Static Binary**: `CGO_ENABLED=0` creates a standalone executable
- **Migration Support**: Includes database migration tools
- **Health Checks**: `wait-for.sh` ensures dependencies are ready
- **Startup Script**: `start.sh` handles initialization

### Complete Service Stack

The system runs **6 containerized services**:

#### 1. PostgreSQL Database
```yaml
postgres:
  image: postgres:12-alpine
  environment:
    POSTGRES_USER: root
    POSTGRES_PASSWORD: secret
    POSTGRES_DB: bilitioo
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

#### 2. Redis Cache
```yaml
redis:
  image: redis:latest
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

#### 3. Elasticsearch (Search Engine)
```yaml
elasticsearch:
  image: elasticsearch:8.15.0
  environment:
    - "discovery.type=single-node"
    - "xpack.security.enabled=false"
  ports:
    - "9200:9200"
  volumes:
    - esdata:/usr/share/elasticsearch/data
```

#### 4. Kibana (Analytics Dashboard)
```yaml
kibana:
  image: kibana:8.15.0
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch
```

#### 5. pgAdmin (Database Management)
```yaml
pgadmin:
  image: dpage/pgadmin4
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@admin.com
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
  depends_on:
    - postgres
```

#### 6. Main API Service
```yaml
api:
  build:
    context: .
    dockerfile: Dockerfile
  environment:
    - HTTP_SERVER_ADDRESS=0.0.0.0:3000
    - DB_SOURCE=postgresql://root:secret@postgres:5432/bilitioo?sslmode=disable
    - REDIS_ADDRESS=redis:6379
    - ELASTICSEARCH_ADDRESS=http://elasticsearch:9200
  depends_on:
    - postgres
    - redis
    - elasticsearch
```

## 📱 Application Features

### User Features
- **🔐 Authentication**: Secure login/register with JWT tokens
- **🔍 Ticket Search**: Search by origin, destination, date, and vehicle type
- **🎫 Booking System**: Reserve and purchase tickets with multiple payment methods
- **💳 Payment Processing**: Wallet, Credit Card, and other payment options
- **📋 Reservation Management**: View, pay for, and cancel reservations
- **👤 Profile Management**: Update personal information and wallet balance
- **🆘 Support System**: Submit and track support requests

### Admin Features
- **📊 Dashboard**: System operations overview
- **📝 Report Management**: View and respond to user reports
- **🎫 Ticket Management**: Complete system ticket oversight
- **👥 User Management**: Search user tickets and reservations
- **⚙️ Status Management**: Update reservation statuses

## 🌐 API Architecture

The system uses a RESTful API architecture with the following endpoints:

### Authentication APIs
- `POST /sign-in` - User registration
- `POST /log-in` - User authentication

### User Management APIs
- `GET /profile` - Get user profile and wallet
- `PUT /profile` - Update user profile
- `GET /city` - Get available cities

### Ticket & Booking APIs
- `POST /search-tickets` - Search available tickets
- `GET /ticket-detail/:id` - Get ticket details
- `POST /reservation` - Create new reservation
- `GET /allReservation` - Get user reservations

### Payment & Cancellation APIs
- `POST /payment` - Process payments
- `GET /ticket-penalties/:ticket_id` - Get cancellation penalties
- `PUT /penalty/:ticket_id` - Process cancellations

### Support APIs
- `POST /report` - Submit support requests
- `GET /reports` - Get user reports

### Admin APIs
- `GET /admin/reports` - Get all system reports
- `PUT /admin/reports/answer` - Respond to reports
- `PUT /admin/reports/manage` - Update reservation status
- `GET /admin/tickets` - Get all system tickets
- `GET /admin/users/:id/completed-tickets` - Get user's completed tickets
- `GET /admin/users/:id/notcompleted-tickets` - Get user's pending tickets

## 🛠️ Development Setup

### Available Make Commands

| Command | Description |
|---------|-------------|
| `make all` | Complete setup: dependencies + backend + frontend |
| `make build` | Build the frontend Docker image |
| `make up` | Start the frontend container |
| `make down` | Stop and remove containers and volumes |
| `make logs` | View frontend logs in real-time |
| `make reset` | Full reset: stop, remove, and restart |
| `make get-dep` | Download external dependencies |
| `make run-dep-makefile` | Run the backend's Makefile |

### Service Access Points

Once all containers are running, access the services at:

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Database (PostgreSQL)**: localhost:5432
- **Redis Cache**: localhost:6379
- **Elasticsearch**: http://localhost:9200
- **Kibana Dashboard**: http://localhost:5601
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## 🗂️ Project Structure

```
bilitioo/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── PaymentModal.js
│   │   │   └── SupportWidget.js
│   │   ├── pages/              # Page components
│   │   │   ├── UserDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile              # Frontend containerization
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── Dockerfile              # Backend containerization
│   ├── wait-for.sh            # Dependency wait script
│   └── start.sh               # Startup script
├── docker-compose.yml          # Complete service orchestration
├── nginx.conf                  # Nginx configuration
└── Makefile                   # Development automation
```

## 🔐 Security & Authentication

### JWT Authentication Flow
1. **User Registration/Login**: Credentials sent to backend API
2. **Token Generation**: Backend generates JWT with user role
3. **Token Storage**: Frontend stores token in localStorage
4. **Request Authorization**: Token included in API request headers
5. **Route Protection**: `PrivateRoute` component validates access
6. **Role-based Access**: Different interfaces for USER/ADMIN roles

### Route Protection
```
Public Routes:
├── / (Home)
├── /login
└── /register

Protected User Routes:
├── /dashboard
├── /profile
├── /tickets/:id
├── /reservations
└── /reports

Protected Admin Routes:
├── /admin/dashboard
├── /admin/reports
├── /admin/tickets
└── /admin/user-tickets
```

## 🐳 Docker Benefits & Design

### Why Docker?

1. **Environment Consistency**: Same environment across development, testing, and production
2. **Easy Deployment**: Single command deployment with `docker-compose up`
3. **Service Isolation**: Each service runs in its own container
4. **Scalability**: Easy to scale individual services
5. **Dependency Management**: No need to install databases locally

### Multi-Stage Build Benefits

The frontend uses a multi-stage build that provides:

- **Smaller Production Images**: Final image only contains built assets and Nginx
- **Security**: No source code or development dependencies in production
- **Performance**: Optimized Nginx serves static files efficiently
- **Caching**: Docker layer caching speeds up rebuilds

### Container Orchestration

Docker Compose manages the entire stack:

- **Service Dependencies**: `depends_on` ensures proper startup order
- **Health Checks**: `wait-for.sh` scripts ensure services are ready
- **Persistent Storage**: Named volumes for data persistence
- **Network Isolation**: Services communicate via Docker network
- **Restart Policies**: Automatic container restart on failure

## 🔧 Development Workflow

### Starting Development
```bash
# Clone the repository
git clone <repository-url>
cd bilitioo

# Start all services
make all

# View logs
make logs
```

### Stopping Services
```bash
# Stop all containers
make down

# Full reset (removes data)
make reset
```

### Debugging

```bash
# View specific service logs
docker compose logs frontend
docker compose logs api
docker compose logs postgres

# Access container shell
docker compose exec frontend sh
docker compose exec api sh

# Check container status
docker compose ps
```

## 🛠️ Configuration

### Environment Variables

The backend API uses environment variables for configuration:

- `HTTP_SERVER_ADDRESS`: Server bind address (0.0.0.0:3000)
- `DB_SOURCE`: PostgreSQL connection string
- `REDIS_ADDRESS`: Redis server address
- `ELASTICSEARCH_ADDRESS`: Elasticsearch server URL

### Service Configuration

- **Frontend**: Served by Nginx on port 3001
- **Backend**: Go application on port 3000
- **Database**: PostgreSQL with persistent storage
- **Cache**: Redis for session management
- **Search**: Elasticsearch for advanced search features
- **Analytics**: Kibana for monitoring
- **DB Admin**: pgAdmin for database management

## 📋 Data Management

### Persistent Volumes

The system uses Docker volumes for data persistence:

- `postgres_data`: Database files
- `redis_data`: Cache data
- `pgadmin_data`: pgAdmin configuration
- `esdata`: Elasticsearch indices

### Database Schema

The PostgreSQL database includes tables for:
- Users and authentication
- Cities and locations
- Tickets and schedules
- Reservations and bookings
- Payments and transactions
- Support reports and responses

## 🚀 Production Deployment

### Environment Setup

For production deployment:

1. **Update Configuration**: Modify environment variables in `docker-compose.yml`
2. **Security**: Change default passwords and secrets
3. **SSL/TLS**: Configure HTTPS with reverse proxy
4. **Monitoring**: Set up log aggregation and monitoring
5. **Backups**: Configure database backup strategy

### Scaling Considerations

- **Frontend**: Can be scaled horizontally behind a load balancer
- **Backend**: Stateless design allows horizontal scaling
- **Database**: Consider read replicas for high traffic
- **Cache**: Redis cluster for high availability
- **Search**: Elasticsearch cluster for large datasets

## 🔍 Monitoring & Maintenance

### Service Health Checks

Monitor service health through:
- Docker container status: `docker compose ps`
- Application logs: `make logs`
- Database connectivity: pgAdmin interface
- Search functionality: Kibana dashboard

### Backup Strategy

```bash
# Database backup
docker compose exec postgres pg_dump -U root bilitioo > backup.sql

# Restore database
docker compose exec -T postgres psql -U root bilitioo < backup.sql
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Solution: Stop conflicting services or change ports
   ```

2. **Container Startup Issues**
   ```bash
   # Check logs for specific service
   docker compose logs <service-name>
   
   # Restart specific service
   docker compose restart <service-name>
   ```

3. **Database Connection Issues**
   ```bash
   # Verify database is running
   docker compose exec postgres psql -U root -d bilitioo -c "SELECT 1;"
   ```

4. **Frontend Build Issues**
   ```bash
   # Rebuild frontend container
   docker compose build frontend --no-cache
   ```

### Performance Optimization

- **Frontend**: Nginx gzip compression enabled
- **Backend**: Go's efficient concurrent handling
- **Database**: Indexed queries and connection pooling
- **Cache**: Redis for frequently accessed data
- **Search**: Elasticsearch for complex queries

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change default database passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] API rate limiting
- [ ] Input validation and sanitization

## 📄 License

MIT License © 2025 [Matin](https://github.com/Matltin), [Reyhon](https://github.com/ryhn-mir) 🍀

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make all`
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review container logs for debugging

## 🖼️ Application Screenshots

<details>
<summary><b>🔐 Authentication</b></summary>
<br>

**Login & Register**
![Login Page](./docs/images/login.png)
![Register Page](./docs/images/register.png)
![Welcome Page](./docs/images/welcome.png)

</details>

<details>
<summary><b>📷 User Panel</b></summary>
<br>

**Home & Search**
![User Home](./docs/images/user-home.png)
![User Search](./docs/images/user-search.png)

**Bookings & Report**
![User Bookings](./docs/images/user-booking.png)
![User Report](./docs/images/user-report.png)

**Profile & Settings**
![User Profile](./docs/images/user-profile.png)

</details>

<details>
<summary><b>🔑 Admin Panel</b></summary>
<br>

**Dashboard**
![Admin Dashboard](./docs/images/admin-dashboard.png)

**User & Travel Management**
![Manage Users](./docs/images/admin-users.png)
![Manage Travels](./docs/images/admin-travels.png)
![Admin Report](./docs/images/admin-report.png)
![Admin Reservation](./docs/images/admin-change-reservation.png)

</details>

---

**Note**: This is a complete containerized system. Always start the backend services first using `make all` to ensure proper dependency initialization and service orchestration.