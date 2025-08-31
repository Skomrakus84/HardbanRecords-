#!/bin/bash

# =============================================================================
# HardbanRecords Lab - Enhanced Development Script
# =============================================================================
# Uruchom go w terminalu za pomocą: bash next_steps.sh
# Lub dodaj alias: alias hrlab="bash next_steps.sh"

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Konfiguracja projektu
PROJECT_DIR="/mnt/h/Projekty/HardbanRecords-Lab"
BACKEND_PORT=3001
FRONTEND_PORT=5173
POSTGRES_PORT=5432

# Funkcje pomocnicze
function print_header() {
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}    🎵 HardbanRecords Lab - Development Assistant 🎵${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

function print_step() {
    echo -e "${CYAN}--- $1 ---${NC}"
    echo ""
}

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

function print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

function wait_for_next_step() {
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
    clear
}

function check_port() {
    local port=$1
    if lsof -i:$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

function check_postgres() {
    if pg_isready -p $POSTGRES_PORT > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

function start_services() {
    print_step "🚀 Starting Development Services"
    
    # Sprawdź czy jesteśmy w odpowiednim katalogu
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Sprawdź PostgreSQL
    if check_postgres; then
        print_success "PostgreSQL is running on port $POSTGRES_PORT"
    else
        print_warning "PostgreSQL is not running. Please start it manually."
        echo "  - Windows: Start PostgreSQL service"
        echo "  - Linux: sudo systemctl start postgresql"
        echo "  - macOS: brew services start postgresql"
    fi
    
    # Sprawdź i uruchom backend
    if check_port $BACKEND_PORT; then
        print_success "Backend server already running on port $BACKEND_PORT"
    else
        print_info "Starting backend server..."
        if [ -d "backend" ]; then
            cd backend
            npm install > /dev/null 2>&1
            nohup npm start > ../backend.log 2>&1 &
            echo $! > ../backend.pid
            cd ..
            sleep 3
            if check_port $BACKEND_PORT; then
                print_success "Backend server started on port $BACKEND_PORT"
            else
                print_error "Failed to start backend server. Check backend.log"
            fi
        else
            print_error "Backend directory not found"
        fi
    fi
    
    # Sprawdź i uruchom frontend
    if check_port $FRONTEND_PORT; then
        print_success "Frontend server already running on port $FRONTEND_PORT"
    else
        print_info "Starting frontend development server..."
        npm install > /dev/null 2>&1
        nohup npm run dev > frontend.log 2>&1 &
        echo $! > frontend.pid
        sleep 3
        if check_port $FRONTEND_PORT; then
            print_success "Frontend server started on port $FRONTEND_PORT"
        else
            print_error "Failed to start frontend server. Check frontend.log"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Development environment is ready!${NC}"
    echo -e "Frontend: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "Backend:  ${BLUE}http://localhost:$BACKEND_PORT${NC}"
    echo ""
}

function stop_services() {
    print_step "🛑 Stopping Development Services"
    
    cd "$PROJECT_DIR"
    
    # Stop backend
    if [ -f backend.pid ]; then
        local backend_pid=$(cat backend.pid)
        if kill -0 $backend_pid > /dev/null 2>&1; then
            kill $backend_pid
            print_success "Backend server stopped"
        fi
        rm -f backend.pid
    fi
    
    # Stop frontend
    if [ -f frontend.pid ]; then
        local frontend_pid=$(cat frontend.pid)
        if kill -0 $frontend_pid > /dev/null 2>&1; then
            kill $frontend_pid
            print_success "Frontend server stopped"
        fi
        rm -f frontend.pid
    fi
    
    # Kill any remaining processes on our ports
    fuser -k $BACKEND_PORT/tcp > /dev/null 2>&1
    fuser -k $FRONTEND_PORT/tcp > /dev/null 2>&1
    
    print_success "All services stopped"
}

function show_status() {
    print_step "📊 Service Status"
    
    echo -e "${BLUE}Project Directory:${NC} $PROJECT_DIR"
    echo ""
    
    # PostgreSQL status
    if check_postgres; then
        print_success "PostgreSQL: Running on port $POSTGRES_PORT"
    else
        print_error "PostgreSQL: Not running"
    fi
    
    # Backend status
    if check_port $BACKEND_PORT; then
        print_success "Backend: Running on port $BACKEND_PORT"
    else
        print_error "Backend: Not running"
    fi
    
    # Frontend status
    if check_port $FRONTEND_PORT; then
        print_success "Frontend: Running on port $FRONTEND_PORT"
    else
        print_error "Frontend: Not running"
    fi
    echo ""
}

function show_logs() {
    print_step "📝 Recent Logs"
    
    cd "$PROJECT_DIR"
    
    if [ -f backend.log ]; then
        echo -e "${BLUE}Backend logs (last 10 lines):${NC}"
        tail -10 backend.log
        echo ""
    fi
    
    if [ -f frontend.log ]; then
        echo -e "${BLUE}Frontend logs (last 10 lines):${NC}"
        tail -10 frontend.log
        echo ""
    fi
}

function development_menu() {
    while true; do
        clear
        print_header
        show_status
        
        echo -e "${CYAN}Choose an option:${NC}"
        echo "1. Start all services"
        echo "2. Stop all services"
        echo "3. Restart services"
        echo "4. Show logs"
        echo "5. Open URLs in browser"
        echo "6. Continue with development steps"
        echo "7. Exit"
        echo ""
        
        read -p "Enter your choice [1-7]: " choice
        
        case $choice in
            1) start_services; wait_for_next_step ;;
            2) stop_services; wait_for_next_step ;;
            3) stop_services; sleep 2; start_services; wait_for_next_step ;;
            4) show_logs; wait_for_next_step ;;
            5) 
                if command -v xdg-open > /dev/null; then
                    xdg-open "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1
                    xdg-open "http://localhost:$BACKEND_PORT" > /dev/null 2>&1
                elif command -v open > /dev/null; then
                    open "http://localhost:$FRONTEND_PORT"
                    open "http://localhost:$BACKEND_PORT"
                else
                    echo "Please open manually:"
                    echo "Frontend: http://localhost:$FRONTEND_PORT"
                    echo "Backend:  http://localhost:$BACKEND_PORT"
                fi
                wait_for_next_step
                ;;
            6) break ;;
            7) 
                echo "Goodbye!"
                exit 0
                ;;
            *) 
                print_error "Invalid choice. Please try again."
                sleep 2
                ;;
        esac
    done
}

# =============================================================================
# PROJECT PLAN MANAGEMENT
# =============================================================================

function create_project_plan() {
    cat > PROJECT_PLAN.md << 'EOF'
# 🎵 HardbanRecords Lab - Development Plan

## 📊 Progress Overview
- [ ] **Phase 1**: Frontend Foundations (0/4 completed)
- [ ] **Phase 2**: Music Module (0/5 completed)  
- [ ] **Phase 3**: Publishing Module (0/4 completed)
- [ ] **Phase 4**: Production Ready (0/6 completed)

**Overall Progress: 0/19 tasks completed (0%)**

---

## 🏗️ Phase 1: Frontend Foundations

### ✅ Task 1.1: Project Setup
- [ ] Install dependencies (zustand, react-router-dom, axios)
- [ ] Setup TypeScript configuration
- [ ] Create folder structure
- [ ] Configure development environment

### ⏳ Task 1.2: Zustand Store Implementation
- [ ] Create `src/store/appStore.ts`
- [ ] Define interfaces for Music and Publishing
- [ ] Implement fetchInitialData action
- [ ] Add error handling and loading states
- [ ] Test API connectivity

### ⏳ Task 1.3: Routing & Navigation
- [ ] Setup React Router in `src/App.tsx`
- [ ] Create main routes: Dashboard, Music, Publishing
- [ ] Implement navigation components
- [ ] Add responsive layout

### ⏳ Task 1.4: Layout Components
- [ ] Create `src/components/Layout/Sidebar.tsx`
- [ ] Create `src/components/Layout/Header.tsx`
- [ ] Implement dark theme
- [ ] Add mobile responsiveness

---

## 🎵 Phase 2: Music Module

### ⏳ Task 2.1: Music Page Structure
- [ ] Create `src/pages/Music/MusicPage.tsx`
- [ ] Implement tab navigation (Releases, Splits, Tasks)
- [ ] Add view state management
- [ ] Connect to Zustand store

### ⏳ Task 2.2: Releases Management
- [ ] Create `src/pages/Music/ReleasesView.tsx`
- [ ] Implement releases grid/list view
- [ ] Add release creation form
- [ ] Implement CRUD operations
- [ ] Add release status management

### ⏳ Task 2.3: Splits Management
- [ ] Create `src/pages/Music/SplitsView.tsx`
- [ ] Implement splits calculator
- [ ] Add percentage validation (must sum to 100%)
- [ ] Create splits assignment interface
- [ ] Add splits history tracking

### ⏳ Task 2.4: AI Cover Generator
- [ ] Integrate with `/api/ai/generate-images`
- [ ] Create image generation interface
- [ ] Add style/prompt selection
- [ ] Implement image preview and save
- [ ] Add generated images gallery

### ⏳ Task 2.5: Music Tasks & Workflow
- [ ] Create `src/pages/Music/TasksView.tsx`
- [ ] Implement task creation and management
- [ ] Add deadline tracking
- [ ] Create workflow automation

---

## 📚 Phase 3: Publishing Module

### ⏳ Task 3.1: Publishing Page Structure
- [ ] Create `src/pages/Publishing/PublishingPage.tsx`
- [ ] Implement navigation (Books, Manuscripts, Tasks)
- [ ] Add book library interface
- [ ] Connect to publishing store

### ⏳ Task 3.2: Manuscript Editor
- [ ] Create `src/pages/Publishing/ManuscriptEditor.tsx`
- [ ] Integrate rich text editor
- [ ] Add chapter management
- [ ] Implement auto-save functionality
- [ ] Add word count and statistics

### ⏳ Task 3.3: AI Writing Assistant
- [ ] Integrate with `/api/ai/generate-content`
- [ ] Create writing suggestions interface
- [ ] Add grammar and style corrections
- [ ] Implement content continuation
- [ ] Add multiple writing styles

### ⏳ Task 3.4: Publishing Analytics
- [ ] Create analytics dashboard
- [ ] Track writing progress
- [ ] Add reading time estimates
- [ ] Implement goal setting and tracking

---

## 🚀 Phase 4: Production Ready

### ⏳ Task 4.1: Authentication System
- [ ] Implement JWT authentication
- [ ] Create login/register forms
- [ ] Add protected routes
- [ ] Implement user session management
- [ ] Add password reset functionality

### ⏳ Task 4.2: File Upload System
- [ ] Setup AWS S3 integration
- [ ] Implement image upload for covers
- [ ] Add audio file upload capability
- [ ] Create document upload system
- [ ] Add file compression and optimization

### ⏳ Task 4.3: Performance Optimization
- [ ] Add code splitting and lazy loading
- [ ] Implement caching strategies
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Implement error boundaries

### ⏳ Task 4.4: Testing & Quality
- [ ] Setup unit testing (Jest, React Testing Library)
- [ ] Add integration tests
- [ ] Implement E2E testing (Playwright)
- [ ] Add code quality tools (ESLint, Prettier)
- [ ] Setup CI/CD pipeline

### ⏳ Task 4.5: Production Build
- [ ] Configure environment variables
- [ ] Setup production builds
- [ ] Add error tracking (Sentry)
- [ ] Implement analytics
- [ ] Add monitoring and logging

### ⏳ Task 4.6: Deployment
- [ ] Create Docker containers
- [ ] Setup GitHub Actions CI/CD
- [ ] Deploy to cloud platform
- [ ] Configure domain and SSL
- [ ] Add backup strategies

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: CSS-in-JS / Styled Components
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: AWS S3
- **AI Integration**: OpenAI API

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + Railway (Backend)
- **Monitoring**: Sentry + Custom analytics

---

## 📝 Development Notes

### Current Focus
Working on Phase 1 - setting up the foundation for the application.

### Next Priorities
1. Complete Zustand store implementation
2. Setup routing and navigation
3. Create responsive layout components

### Known Issues
- [ ] API endpoint /api/data needs to be tested
- [ ] TypeScript configuration needs optimization
- [ ] CSS-in-JS setup needs finalization

---

*Last updated: $(date)*
*Generated by: HardbanRecords Lab Development Script*
EOF

    print_success "PROJECT_PLAN.md created with full development roadmap!"
}

function update_task_status() {
    local phase=$1
    local task=$2
    local status=$3  # "completed" or "in_progress"
    
    if [ ! -f "PROJECT_PLAN.md" ]; then
        create_project_plan
        return
    fi
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $status in
        "completed")
            # Update task status to completed
            sed -i "s/- \[ \] \*\*Task $phase\.$task:/- [x] **Task $phase.$task:/" PROJECT_PLAN.md
            print_success "Task $phase.$task marked as completed!"
            ;;
        "in_progress")
            # Update task status to in progress
            sed -i "s/- \[ \] \*\*Task $phase\.$task:/- [⏳] **Task $phase.$task:/" PROJECT_PLAN.md
            print_info "Task $phase.$task marked as in progress!"
            ;;
    esac
    
    # Update last modified timestamp
    sed -i "s/\*Last updated:.*/\*Last updated: $timestamp\*/" PROJECT_PLAN.md
    
    # Recalculate progress
    update_progress_stats
}

function update_progress_stats() {
    if [ ! -f "PROJECT_PLAN.md" ]; then
        return
    fi
    
    # Count completed tasks per phase
    local phase1_completed=$(grep -c "- \[x\] \*\*Task 1\." PROJECT_PLAN.md || echo 0)
    local phase2_completed=$(grep -c "- \[x\] \*\*Task 2\." PROJECT_PLAN.md || echo 0)
    local phase3_completed=$(grep -c "- \[x\] \*\*Task 3\." PROJECT_PLAN.md || echo 0)
    local phase4_completed=$(grep -c "- \[x\] \*\*Task 4\." PROJECT_PLAN.md || echo 0)
    
    local total_completed=$((phase1_completed + phase2_completed + phase3_completed + phase4_completed))
    local total_tasks=19
    local progress_percent=$(( (total_completed * 100) / total_tasks ))
    
    # Update progress overview
    sed -i "s/- \[ \] \*\*Phase 1\*\*:.*/- [$([ $phase1_completed -eq 4 ] && echo "x" || echo " ")] **Phase 1**: Frontend Foundations ($phase1_completed\/4 completed)/" PROJECT_PLAN.md
    sed -i "s/- \[ \] \*\*Phase 2\*\*:.*/- [$([ $phase2_completed -eq 5 ] && echo "x" || echo " ")] **Phase 2**: Music Module ($phase2_completed\/5 completed)/" PROJECT_PLAN.md
    sed -i "s/- \[ \] \*\*Phase 3\*\*:.*/- [$([ $phase3_completed -eq 4 ] && echo "x" || echo " ")] **Phase 3**: Publishing Module ($phase3_completed\/4 completed)/" PROJECT_PLAN.md
    sed -i "s/- \[ \] \*\*Phase 4\*\*:.*/- [$([ $phase4_completed -eq 6 ] && echo "x" || echo " ")] **Phase 4**: Production Ready ($phase4_completed\/6 completed)/" PROJECT_PLAN.md
    
    # Update overall progress
    sed -i "s/\*\*Overall Progress:.*/\*\*Overall Progress: $total_completed\/$total_tasks tasks completed ($progress_percent%)\*\*/" PROJECT_PLAN.md
    
    echo "Progress updated: $total_completed/$total_tasks tasks ($progress_percent%)"
}

function interactive_task_update() {
    print_step "📋 Update Task Progress"
    
    if [ ! -f "PROJECT_PLAN.md" ]; then
        print_info "Creating PROJECT_PLAN.md..."
        create_project_plan
    fi
    
    echo "Select Phase:"
    echo "1. Phase 1: Frontend Foundations"
    echo "2. Phase 2: Music Module"
    echo "3. Phase 3: Publishing Module"
    echo "4. Phase 4: Production Ready"
    echo ""
    
    read -p "Enter phase number [1-4]: " phase_num
    
    case $phase_num in
        1)
            echo "Phase 1 Tasks:"
            echo "1. Project Setup"
            echo "2. Zustand Store Implementation" 
            echo "3. Routing & Navigation"
            echo "4. Layout Components"
            ;;
        2)
            echo "Phase 2 Tasks:"
            echo "1. Music Page Structure"
            echo "2. Releases Management"
            echo "3. Splits Management"
            echo "4. AI Cover Generator"
            echo "5. Music Tasks & Workflow"
            ;;
        3)
            echo "Phase 3 Tasks:"
            echo "1. Publishing Page Structure"
            echo "2. Manuscript Editor"
            echo "3. AI Writing Assistant"
            echo "4. Publishing Analytics"
            ;;
        4)
            echo "Phase 4 Tasks:"
            echo "1. Authentication System"
            echo "2. File Upload System"
            echo "3. Performance Optimization"
            echo "4. Testing & Quality"
            echo "5. Production Build"
            echo "6. Deployment"
            ;;
        *)
            print_error "Invalid phase number"
            return
            ;;
    esac
    
    echo ""
    read -p "Enter task number: " task_num
    
    echo ""
    echo "Status options:"
    echo "1. Mark as completed ✅"
    echo "2. Mark as in progress ⏳"
    echo ""
    
    read -p "Enter status [1-2]: " status_choice
    
    case $status_choice in
        1) update_task_status $phase_num $task_num "completed" ;;
        2) update_task_status $phase_num $task_num "in_progress" ;;
        *) print_error "Invalid status choice" ;;
    esac
}

function show_current_progress() {
    print_step "📊 Current Development Progress"
    
    if [ ! -f "PROJECT_PLAN.md" ]; then
        print_warning "PROJECT_PLAN.md not found. Creating..."
        create_project_plan
    fi
    
    echo "Reading progress from PROJECT_PLAN.md..."
    echo ""
    
    # Show progress overview
    grep -A 5 "Progress Overview" PROJECT_PLAN.md | tail -5
    echo ""
    
    # Show current focus
    echo -e "${BLUE}Current Focus:${NC}"
    grep -A 10 "### Current Focus" PROJECT_PLAN.md | tail -9
    echo ""
}

function add_development_note() {
    print_step "📝 Add Development Note"
    
    if [ ! -f "PROJECT_PLAN.md" ]; then
        create_project_plan
    fi
    
    echo "Enter your development note:"
    read -r note
    
    if [ -n "$note" ]; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        # Add note to development notes section
        sed -i "/### Known Issues/i\\
- [$timestamp] $note\\
" PROJECT_PLAN.md
        
        print_success "Note added to PROJECT_PLAN.md"
    fi
}

function backup_project_plan() {
    if [ -f "PROJECT_PLAN.md" ]; then
        local backup_name="PROJECT_PLAN_backup_$(date +%Y%m%d_%H%M%S).md"
        cp PROJECT_PLAN.md "$backup_name"
        print_success "Backup created: $backup_name"
    fi
}

# =============================================================================
# AUTO-STARTUP INTEGRATION
# =============================================================================

function create_bashrc_integration() {
    print_step "⚡ Auto-Startup Integration Setup"
    
    local bashrc_code="
# HardbanRecords Lab Auto-Startup
if [ -d \"$PROJECT_DIR\" ]; then
    cd \"$PROJECT_DIR\"
    
    # Only auto-start if we're in the project terminal session
    if [ \"\$HR_LAB_AUTO_START\" = \"true\" ]; then
        echo \"🎵 Welcome to HardbanRecords Lab! 🎵\"
        
        # Check if services need to be started
        if ! lsof -i:$BACKEND_PORT > /dev/null 2>&1; then
            echo \"Starting backend server...\"
            cd backend && nohup npm start > ../backend.log 2>&1 &
            echo \$! > ../backend.pid
            cd ..
        fi
        
        if ! lsof -i:$FRONTEND_PORT > /dev/null 2>&1; then
            echo \"Starting frontend development server...\"
            nohup npm run dev > frontend.log 2>&1 &
            echo \$! > frontend.pid
        fi
        
        echo \"\"
        echo \"🚀 Development environment ready!\"
        echo \"Frontend: http://localhost:$FRONTEND_PORT\"
        echo \"Backend:  http://localhost:$BACKEND_PORT\"
        echo \"\"
        echo \"Type 'hrlab' to open development assistant\"
        echo \"\"
        
        # Clear the auto-start flag
        unset HR_LAB_AUTO_START
    fi
fi

# Alias for quick access
alias hrlab='bash \"$PROJECT_DIR/next_steps.sh\"'
alias hrlab-start='HR_LAB_AUTO_START=true bash'
alias hrlab-stop='cd \"$PROJECT_DIR\" && [ -f backend.pid ] && kill \$(cat backend.pid) && rm backend.pid; [ -f frontend.pid ] && kill \$(cat frontend.pid) && rm frontend.pid'
"
    
    # Offer to add to bashrc
    echo "Would you like to add auto-startup integration to your shell?"
    echo "This will add aliases and optional auto-start functionality."
    echo ""
    echo "Aliases that will be added:"
    echo "• hrlab        - Open development assistant"
    echo "• hrlab-start  - Start new terminal with auto-startup"
    echo "• hrlab-stop   - Stop all services"
    echo ""
    
    read -p "Add to ~/.bashrc? [y/N]: " add_bashrc
    
    if [[ $add_bashrc =~ ^[Yy]$ ]]; then
        # Backup existing bashrc
        if [ -f ~/.bashrc ]; then
            cp ~/.bashrc ~/.bashrc.backup.$(date +%Y%m%d_%H%M%S)
            print_success "Backed up existing ~/.bashrc"
        fi
        
        # Add our integration
        echo "$bashrc_code" >> ~/.bashrc
        print_success "Added HardbanRecords Lab integration to ~/.bashrc"
        print_info "Restart your terminal or run: source ~/.bashrc"
        
        # Also create a dedicated terminal launcher
        cat > start_hrlab_terminal.sh << EOF
#!/bin/bash
export HR_LAB_AUTO_START=true
exec bash
EOF
        chmod +x start_hrlab_terminal.sh
        print_success "Created start_hrlab_terminal.sh for quick launching"
    else
        print_info "Integration not added. You can run this script manually anytime."
    fi
}

# =============================================================================
# SMART PROJECT DETECTION
# =============================================================================

function detect_project_progress() {
    print_step "🔍 Detecting Current Project State"
    
    if [ ! -f "PROJECT_PLAN.md" ]; then
        print_info "No PROJECT_PLAN.md found. Creating new one..."
        create_project_plan
        return
    fi
    
    echo "Analyzing project files..."
    
    # Auto-detect completed tasks based on file existence and content
    local detected_progress=()
    
    # Phase 1 detection
    if [ -f "package.json" ] && grep -q "zustand\|react-router-dom" package.json; then
        detected_progress+=("1.1")
        update_task_status 1 1 "completed"
    fi
    
    if [ -f "src/store/appStore.ts" ] && grep -q "fetchInitialData" src/store/appStore.ts; then
        detected_progress+=("1.2")
        update_task_status 1 2 "completed"
    fi
    
    if [ -f "src/App.tsx" ] && grep -q "BrowserRouter\|Router" src/App.tsx; then
        detected_progress+=("1.3")
        update_task_status 1 3 "completed"
    fi
    
    if [ -f "src/components/Layout/Sidebar.tsx" ] && [ -f "src/components/Layout/Header.tsx" ]; then
        detected_progress+=("1.4")
        update_task_status 1 4 "completed"
    fi
    
    # Phase 2 detection
    if [ -f "src/pages/Music/MusicPage.tsx" ]; then
        detected_progress+=("2.1")
        update_task_status 2 1 "completed"
    fi
    
    if [ -f "src/pages/Music/ReleasesView.tsx" ]; then
        detected_progress+=("2.2")
        update_task_status 2 2 "completed"
    fi
    
    if [ -f "src/pages/Music/SplitsView.tsx" ]; then
        detected_progress+=("2.3")
        update_task_status 2 3 "completed"
    fi
    
    # Phase 3 detection
    if [ -f "src/pages/Publishing/PublishingPage.tsx" ]; then
        detected_progress+=("3.1")
        update_task_status 3 1 "completed"
    fi
    
    if [ -f "src/pages/Publishing/ManuscriptEditor.tsx" ]; then
        detected_progress+=("3.2")
        update_task_status 3 2 "completed"
    fi
    
    # Phase 4 detection
    if [ -f "src/components/Auth/LoginForm.tsx" ] || grep -q "jwt\|auth" package.json 2>/dev/null; then
        detected_progress+=("4.1")
        update_task_status 4 1 "in_progress"
    fi
    
    if [ -f "Dockerfile" ]; then
        detected_progress+=("4.6")
        update_task_status 4 6 "in_progress"
    fi
    
    if [ ${#detected_progress[@]} -gt 0 ]; then
        print_success "Auto-detected ${#detected_progress[@]} completed/in-progress tasks!"
        echo "Detected: ${detected_progress[*]}"
    else
        print_info "No completed tasks detected. Starting fresh!"
    fi
    
    update_progress_stats
}

clear
print_header

# Sprawdź czy jesteśmy w odpowiednim katalogu
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    print_info "Please update PROJECT_DIR variable in this script or create the directory."
    echo ""
    read -p "Create project directory? [y/N]: " create_dir
    if [[ $create_dir =~ ^[Yy]$ ]]; then
        mkdir -p "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        print_success "Project directory created!"
        
        # Initialize basic project structure
        npm init -y > /dev/null 2>&1
        mkdir -p src backend
        
        print_info "Basic project structure initialized"
    else
        exit 1
    fi
fi

cd "$PROJECT_DIR"

# Smart project detection
detect_project_progress

# Offer bashrc integration on first run
if [ ! -f ".hrlab_configured" ]; then
    create_bashrc_integration
    touch .hrlab_configured
fi

# Pokaż menu kontroli serwisów
development_menu

# --- KROK 1: URUCHOMIENIE ŚRODOWISKA ---
print_step "KROK 1: Weryfikacja środowiska deweloperskiego"

echo "Sprawdzam status serwisów..."
show_status

if ! check_postgres; then
    print_warning "PostgreSQL nie jest uruchomiony!"
    echo "Instrukcje uruchomienia:"
    echo "• Windows: Uruchom PostgreSQL service przez Services.msc"
    echo "• Linux: sudo systemctl start postgresql"
    echo "• macOS: brew services start postgresql"
    echo "• Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
fi

if ! check_port $BACKEND_PORT || ! check_port $FRONTEND_PORT; then
    print_info "Uruchamiam brakujące serwisy..."
    start_services
fi

wait_for_next_step

# --- KROK 2: FUNDAMENTY FRONTENDU ---
print_step "KROK 2: Fundamenty Frontendu (Faza 1)"

# Sprawdź czy PROJECT_PLAN.md istnieje
if [ ! -f "PROJECT_PLAN.md" ]; then
    print_info "Creating PROJECT_PLAN.md with development roadmap..."
    create_project_plan
fi

echo "📋 Lista zadań do wykonania:"
echo ""
echo "1. ✓ Zustand Store - stwórz src/store/appStore.ts"
echo "   • Zdefiniuj interfejsy dla Music i Publishing"
echo "   • Dodaj akcje fetchInitialData, addRelease, updateRelease"
echo "   • Podłącz axios do komunikacji z API"

# Auto-update if store exists
if [ -f "src/store/appStore.ts" ]; then
    print_success "Zustand store already exists!"
    update_task_status 1 2 "completed"
else
    print_warning "Zustand store not found. Run Quick Setup first."
fi

echo ""
echo "2. ✓ Router Setup - zaktualizuj src/App.tsx"
echo "   • Zainstaluj: npm install react-router-dom"
echo "   • Stwórz routing: / → Dashboard, /music → MusicPage, /publishing → PublishingPage"

# Check if routing is setup
if grep -q "react-router-dom" package.json 2>/dev/null; then
    print_success "React Router dependency found!"
    if [ -f "src/App.tsx" ] && grep -q "BrowserRouter\|Router" src/App.tsx 2>/dev/null; then
        print_success "Routing appears to be configured!"
        update_task_status 1 3 "completed"
    fi
fi

echo ""
echo "3. ✓ Layout Components"
echo "   • src/components/Layout/Sidebar.tsx"
echo "   • src/components/Layout/Header.tsx"
echo "   • Responsive design z ciemnym motywem"

# Check layout components
if [ -f "src/components/Layout/Sidebar.tsx" ] && [ -f "src/components/Layout/Header.tsx" ]; then
    print_success "Layout components found!"
    update_task_status 1 4 "completed"
fi

echo ""
echo "4. 🔄 Test połączenia z API"
echo "   • Sprawdź czy store pobiera dane z GET /api/data"
echo "   • Dodaj error handling i loading states"

print_info "Testing API connection..."
if command -v curl > /dev/null; then
    if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null; then
        print_success "API Health Check: OK"
        if curl -s "http://localhost:$BACKEND_PORT/api/data" > /dev/null; then
            print_success "API Data Endpoint: OK"
            update_task_status 1 2 "completed"
        else
            print_warning "API Data Endpoint: Not responding"
        fi
    else
        print_error "API Health Check: Failed - Check backend logs"
    fi
else
    print_warning "curl not found - manual API testing needed"
fi

# Show current Phase 1 progress
echo ""
local phase1_progress=$(grep "Phase 1" PROJECT_PLAN.md | grep -o "[0-9]/4")
print_info "Phase 1 Progress: $phase1_progress"

wait_for_next_step

# --- KROK 3: MODUŁ MUZYCZNY ---
print_step "KROK 3: Implementacja Modułu Muzycznego (Faza 2)"

echo "🎵 Komponenty do stworzenia:"
echo ""
echo "1. 📱 src/pages/Music/MusicPage.tsx"
echo "   • Navigation tabs: Releases, Splits, Tasks"
echo "   • Integracja z Zustand store"
echo ""
echo "2. 📀 src/pages/Music/ReleasesView.tsx"
echo "   • Grid z kartami wydawnictw"
echo "   • Formularz dodawania nowego release"
echo "   • CRUD operations (Create, Read, Update, Delete)"
echo ""
echo "3. 💰 src/pages/Music/SplitsView.tsx"
echo "   • Zarządzanie podziałami tantiemów"
echo "   • Kalkulatory procentów"
echo "   • Walidacja (suma = 100%)"
echo ""
echo "4. 🤖 AI Generator Okładek"
echo "   • Integracja z /api/ai/generate-images"
echo "   • Preview i zapisywanie obrazów"
echo "   • Multiple style options"
echo ""
echo "🎯 Cel: Pełny workflow od dodania utworu do wygenerowania okładki"

wait_for_next_step

# --- KROK 4: MODUŁ WYDAWNICZY ---
print_step "KROK 4: Implementacja Modułu Wydawniczego (Faza 3)"

echo "📚 Komponenty do stworzenia:"
echo ""
echo "1. 📖 src/pages/Publishing/PublishingPage.tsx"
echo "   • Navigation: Books, Manuscripts, Tasks"
echo "   • Library management"
echo ""
echo "2. ✍️ src/pages/Publishing/ManuscriptEditor.tsx"
echo "   • Rich text editor (np. TinyMCE, Quill)"
echo "   •章节管理 (Chapter management)"
echo "   • Auto-save functionality"
echo ""
echo "3. 🤖 AI Writing Assistant"
echo "   • Integracja z /api/ai/generate-content"
echo "   • Sugestie, korekty, kontynuacje"
echo "   • Różne style pisania"
echo ""
echo "4. 📊 Publishing Analytics"
echo "   • Statystyki słów, rozdziałów"
echo "   • Progress tracking"
echo ""
echo "🎯 Cel: Pełny workflow od pisania do publikacji"

wait_for_next_step

# --- KROK 5: KOMERCJALIZACJA ---
print_step "KROK 5: Finalizacja i Komercjalizacja (Faza 4)"

echo "🚀 Przygotowanie do produkcji:"
echo ""
echo "1. 🔐 Autentykacja"
echo "   • JWT implementation"
echo "   • Login/Register forms"
echo "   • Protected routes"
echo ""
echo "2. ☁️ File Upload (AWS S3)"
echo "   • Image uploads dla okładek"
echo "   • Audio file uploads"
echo "   • Document uploads"
echo ""
echo "3. 🏗️ Production Build"
echo "   • Environment variables"
echo "   • Build optimization"
echo "   • Error tracking (Sentry)"
echo ""
echo "4. 🌐 Deployment"
echo "   • Docker containers"
echo "   • CI/CD pipeline (GitHub Actions)"
echo "   • Cloud hosting (Vercel/Railway/AWS)"
echo ""
echo "🎯 Cel: Live application ready for users"

wait_for_next_step

# =============================================================================
# QUICK SETUP FUNCTION
# =============================================================================

function quick_setup() {
    print_step "🔧 Quick Project Setup"
    
    cd "$PROJECT_DIR"
    
    # Create PROJECT_PLAN.md if it doesn't exist
    if [ ! -f "PROJECT_PLAN.md" ]; then
        print_info "Creating PROJECT_PLAN.md..."
        create_project_plan
        update_task_status 1 1 "in_progress"
    fi
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install zustand react-router-dom axios @types/react @types/react-dom > /dev/null 2>&1
    
    # Backend dependencies
    if [ -d "backend" ]; then
        cd backend
        npm install > /dev/null 2>&1
        cd ..
    fi
    
    # Create essential directories
    mkdir -p src/{components/{Layout,UI},pages/{Music,Publishing,Dashboard},store,types,api,utils}
    
    # Create optimized tsconfig.json
    if [ ! -f "tsconfig.json" ] || [ "$1" = "--force-tsconfig" ]; then
        cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext", 
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/store/*": ["./src/store/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/api/*": ["./src/api/*"]
    },
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true,
    "incremental": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build", "coverage", "**/*.test.*"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
        print_success "Created optimized tsconfig.json"
    fi
    
    # Create basic files if they don't exist
    if [ ! -f "src/store/appStore.ts" ]; then
        cat > src/store/appStore.ts << 'EOF'
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface MusicRelease {
  id: number;
  title: string;
  artist: string;
  genre: string;
  status: string;
  releaseDate?: string;
  splits: { name: string; share: string }[];
}

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: string;
}

interface AppState {
  music: { releases: MusicRelease[]; tasks: any[] };
  publishing: { books: Book[]; tasks: any[] };
  isLoading: boolean;
  error: string | null;
  onboardingComplete: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  addRelease: (release: Omit<MusicRelease, 'id'>) => Promise<void>;
  updateRelease: (id: number, data: Partial<MusicRelease>) => Promise<void>;
  deleteRelease: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  music: { releases: [], tasks: [] },
  publishing: { books: [], tasks: [] },
  isLoading: false,
  error: null,
  onboardingComplete: false,
  
  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/data`);
      set({
        music: data.music || { releases: [], tasks: [] },
        publishing: data.publishing || { books: [], tasks: [] },
        onboardingComplete: data.onboardingComplete || false,
        error: null
      });
    } catch (error) {
      set({ error: 'Failed to fetch initial data' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addRelease: async (release) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/music/releases`, release);
      set(state => ({
        music: {
          ...state.music,
          releases: [...state.music.releases, data]
        },
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to add release' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateRelease: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.patch(`${API_URL}/music/releases/${id}`, updateData);
      set(state => ({
        music: {
          ...state.music,
          releases: state.music.releases.map(release =>
            release.id === id ? { ...release, ...data } : release
          )
        },
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to update release' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteRelease: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/music/releases/${id}`);
      set(state => ({
        music: {
          ...state.music,
          releases: state.music.releases.filter(release => release.id !== id)
        },
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to delete release' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearError: () => set({ error: null })
}));

export type { MusicRelease, Book };
EOF
        print_success "Created enhanced Zustand store"
        update_task_status 1 2 "completed"
    fi
    
    # Update task progress
    update_task_status 1 1 "completed"
    
    print_success "Quick setup completed!"
}success "Quick setup completed!"
}

# =============================================================================
# MENU GŁÓWNE
# =============================================================================

function main_menu() {
    while true; do
        clear
        print_header
        
        # Show quick progress if PROJECT_PLAN.md exists
        if [ -f "PROJECT_PLAN.md" ]; then
            local completed=$(grep -c "- \[x\]" PROJECT_PLAN.md || echo 0)
            local total=19
            local percent=$(( (completed * 100) / total ))
            echo -e "${GREEN}📊 Progress: $completed/$total tasks completed ($percent%)${NC}"
            echo ""
        fi
        
        echo -e "${CYAN}What would you like to do?${NC}"
        echo ""
        echo "1. 🚀 Start development environment"
        echo "2. 🛑 Stop all services"
        echo "3. 📊 Show service status"
        echo "4. 🔧 Quick project setup"
        echo "5. 📝 Show logs"
        echo "6. 🌐 Open in browser"
        echo "7. 📋 Follow development steps"
        echo "8. 📈 Update task progress"
        echo "9. 📋 Show current progress"
        echo "10. 📝 Add development note"
        echo "11. 💾 Backup project plan"
        echo "12. 🆘 Show help"
        echo "13. 🚪 Exit"
        echo ""
        
        read -p "Enter your choice [1-13]: " choice
        
        case $choice in
            1) start_services; wait_for_next_step ;;
            2) stop_services; wait_for_next_step ;;
            3) show_status; wait_for_next_step ;;
            4) quick_setup; wait_for_next_step ;;
            5) show_logs; wait_for_next_step ;;
            6) 
                echo "Opening applications..."
                if command -v xdg-open > /dev/null; then
                    xdg-open "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1 &
                elif command -v open > /dev/null; then
                    open "http://localhost:$FRONTEND_PORT" &
                fi
                wait_for_next_step
                ;;
            7) break ;;
            8) interactive_task_update; wait_for_next_step ;;
            9) show_current_progress; wait_for_next_step ;;
            10) add_development_note; wait_for_next_step ;;
            11) backup_project_plan; wait_for_next_step ;;
            12) show_help; wait_for_next_step ;;
            13) 
                echo -e "${GREEN}Happy coding! 🎵📚${NC}"
                exit 0
                ;;
            *) 
                print_error "Invalid choice. Please try again."
                sleep 2
                ;;
        esac
    done
}

function show_help() {
    print_step "🆘 Help & Commands"
    
    echo "Useful commands:"
    echo "• npm run dev          - Start frontend"
    echo "• npm run build        - Build for production"
    echo "• npm run preview      - Preview production build"
    echo "• npm test             - Run tests"
    echo ""
    echo "Backend commands (in backend/ directory):"
    echo "• npm start            - Start backend server"
    echo "• npm run dev          - Start with nodemon"
    echo "• npm run migrate      - Run database migrations"
    echo ""
    echo "Quick tips:"
    echo "• Use React DevTools for debugging"
    echo "• Check browser console for errors"
    echo "• Monitor network tab for API calls"
    echo "• Use Postman to test API endpoints"
}

# =============================================================================
# START SCRIPT
# =============================================================================

# Sprawdź czy uruchamiamy quick setup
if [ "$1" = "--setup" ]; then
    clear
    print_header
    quick_setup
    exit 0
fi

# Sprawdź czy uruchamiamy tylko serwisy
if [ "$1" = "--start" ]; then
    clear
    print_header
    start_services
    exit 0
fi

# Pokaż menu główne
main_menu

# Jeśli użytkownik wybrał "Follow development steps", kontynuuj z krokami rozwoju
clear
print_header
print_info "Starting development walkthrough..."
echo "Detailed plan available in PROJECT_PLAN.md"
echo ""

wait_for_next_step

# Tu kontynuuj z oryginalnymi krokami rozwoju...
# (reszta oryginalnego kodu)

print_step "🎉 Development Script Complete!"
echo "Remember to:"
echo "• Check PROJECT_PLAN.md for detailed specifications"
echo "• Commit your progress regularly"
echo "• Test each feature before moving to next step"
echo "• Ask for help when needed!"
echo ""
echo -e "${GREEN}Happy coding! 🎵📚${NC}"