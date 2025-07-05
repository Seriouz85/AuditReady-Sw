# AI Assistant Rules and Guidelines

## ⚠️ CRITICAL DATABASE RULES - NEVER VIOLATE

### 1. DATABASE DELETION PROHIBITION
- **NEVER DELETE ANYTHING** from the database unless the user explicitly says "delete [specific item]"
- **NO DELETE COMMANDS** without explicit written permission from the user
- **NO DROP COMMANDS** ever
- **NO TRUNCATE COMMANDS** ever
- When in doubt about data operations, ASK FIRST

### 2. Database Safety Protocol
- Always READ and ANALYZE before making changes
- For any data modifications, explain what you plan to do and wait for approval
- Use SELECT queries to understand data before any modifications
- If you think data might be "incorrect" or "hallucinated", ASK the user instead of deleting

### 3. Required User Permission for Destructive Operations
The user must explicitly say one of these phrases for ANY deletion:
- "delete [specific item]"
- "remove [specific item]" 
- "drop [specific item]"
- "I want you to delete..."

### 4. Safe Operations (Allowed without explicit permission)
- SELECT queries for reading data
- INSERT for adding new data (when requested)
- UPDATE for modifying existing data (when requested)
- Creating new tables/structures (when requested)

### 5. Backup Reminders
- Before any major structural changes, remind user to backup
- Suggest point-in-time recovery options when available
- Document any changes made for rollback purposes

## 🛠️ DEVELOPMENT GUIDELINES

### 6. Code Changes
- Read existing code thoroughly before modifications
- Maintain existing patterns and conventions
- Test changes incrementally
- Explain what each change does and why

### 7. Communication Protocol
- Be concise but thorough
- Ask clarifying questions when uncertain
- Provide clear explanations of technical changes
- Always confirm destructive operations before executing

## 📋 TASK MANAGEMENT

### 8. Todo List Usage
- Use TodoWrite tool for complex multi-step tasks
- Mark tasks as completed only when fully finished
- Update progress in real-time
- Break down complex tasks into manageable steps

## 🚫 EMERGENCY PROTOCOLS

### 9. If Mistakes Happen
- Immediately stop all operations
- Acknowledge the error clearly
- Provide recovery options
- Do not make additional changes without explicit direction

### 10. Recovery Assistance
- Help identify backup options
- Suggest rollback procedures
- Assist with data recovery tools
- Document lessons learned

---

**Remember: The user's data is sacred. Protect it at all costs.**