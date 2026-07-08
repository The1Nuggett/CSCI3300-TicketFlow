const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const technicianTicketList = document.getElementById("technicianTicketList");
const myTechnicianTicketList = document.getElementById("myTechnicianTicketList");
const adminOpenTicketList = document.getElementById("adminOpenTicketList");
const adminClosedTicketList = document.getElementById("adminClosedTicketList");
const adminTechnicianBoard = document.getElementById("adminTechnicianBoard");
const portalRole = document.body.dataset.portal || "user";
const technicianAccounts = {
    "technician1@company.com": { level: 1, label: "Level 1 Technician" },
    "technician2@company.com": { level: 2, label: "Level 2 Technician" },
    "technician3@company.com": { level: 3, label: "Level 3 Technician" }
};
const pageParams = new URLSearchParams(window.location.search);
const requestedTechnician = pageParams.get("technician");
const currentTechnician = technicianAccounts[requestedTechnician] ? requestedTechnician : "technician1@company.com";
const currentTechnicianName = pageParams.get("name") || technicianAccounts[currentTechnician]?.label || currentTechnician;
const currentTechnicianLevel = technicianAccounts[currentTechnician]?.level || 1;

let tickets = loadTickets();
let selectedUserTicketId = tickets[0]?.id ?? null;
let selectedTechnicianTicketId = tickets[0]?.id ?? null;
let selectedMyTechnicianTicketId = tickets.find(ticket => ticket.assignedTechnician === currentTechnician)?.id ?? null;
let selectedAdminOpenTicketId = tickets.find(ticket => isActiveTicket(ticket))?.id ?? null;
let selectedAdminClosedTicketId = tickets.find(ticket => !isActiveTicket(ticket))?.id ?? null;
let selectedAdminTechnicianId = "technician1@company.com";
let selectedAdminTicketId = tickets.find(ticket => ticket.assignedTechnician === selectedAdminTechnicianId)?.id ?? null;

function loadTickets() {
    try {
        const savedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
        savedTickets.forEach(normalizeTicketRouting);
        return savedTickets;
    } catch (error) {
        console.error("Unable to load saved tickets.", error);
        return [];
    }
}

function isActiveTicket(ticket) {
    return !["Closed", "Canceled"].includes(ticket.status);
}

function getPriorityScore(ticket) {
    const priorityScores = {
        Critical: 1,
        High: 2,
        Medium: 3,
        Low: 4
    };

    let score = priorityScores[ticket.priority] || 3;
    const department = String(ticket.department || "").toLowerCase();
    const description = String(ticket.description || "").toLowerCase();
    const isFloorOperations = department.includes("floor")
        || description.includes("floor operation");

    if (isFloorOperations) score -= 0.5;
    return Math.max(1, score);
}

function getRequiredLevel(ticket) {
    const score = ticket.priorityScore ?? getPriorityScore(ticket);
    if (score <= 1.5) return 3;
    if (score <= 2.5) return 2;
    return 1;
}

function normalizeTicketRouting(ticket) {
    ticket.priorityScore = ticket.priorityScore ?? getPriorityScore(ticket);
    ticket.requiredLevel = ticket.requiredLevel ?? getRequiredLevel(ticket);
    autoAssignTicket(ticket);

    if (ticket.assignedTechnician && !ticket.assignedTechnicianName) {
        ticket.assignedTechnicianName = technicianAccounts[ticket.assignedTechnician]?.label || ticket.assignedTechnician;
    }
}

function getTechnicianIdByLevel(level) {
    return Object.keys(technicianAccounts).find(technicianId => technicianAccounts[technicianId].level === level) || "technician1@company.com";
}

function autoAssignTicket(ticket) {
    if (ticket.assignedTechnician) return;

    const technicianId = getTechnicianIdByLevel(ticket.requiredLevel || getRequiredLevel(ticket));
    ticket.assignedTechnician = technicianId;
    ticket.assignedTechnicianName = technicianAccounts[technicianId]?.label || technicianId;
}

function getTechnicianDisplayName(technicianId) {
    if (!technicianId) return "Unassigned";
    if (technicianId === currentTechnician) return currentTechnicianName || technicianId;
    return technicianAccounts[technicianId]?.label || technicianId;
}

function generateTicketId() {
    return tickets.length === 0 ? 1001 : Math.max(...tickets.map(ticket => ticket.id)) + 1;
}

function saveTickets() {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

function updateTechnicianPageCopy() {
    const headerDescription = document.getElementById("technicianHeaderDescription");
    const myDeckDescription = document.getElementById("myDeckDescription");

    if (headerDescription) {
        headerDescription.textContent = `Signed in as ${currentTechnicianName} (${technicianAccounts[currentTechnician]?.label || `Level ${currentTechnicianLevel}`}). Tickets are routed to your deck automatically.`;
    }

    if (myDeckDescription) {
        myDeckDescription.textContent = `Tickets assigned to ${currentTechnicianName}. Other technicians cannot view them unless they are escalated or reassigned by admin.`;
    }
}

function formatDate(date) {
    if (!date) return "Not set";
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split("-");
        return new Date(year, month - 1, day).toLocaleDateString();
    }
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleString();
}

function addDetail(container, label, value) {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    paragraph.append(strong, document.createTextNode(value || "Not provided"));
    container.appendChild(paragraph);
}

function createTicketHeading(ticket) {
    const heading = document.createElement("h3");
    heading.textContent = `#${ticket.id} - ${ticket.title}`;
    return heading;
}

function getTechnicianNotes(ticket) {
    if (Array.isArray(ticket.notes)) return ticket.notes;

    if (ticket.technicianNotes && ticket.technicianNotes.trim()) {
        ticket.notes = [{
            text: ticket.technicianNotes.trim(),
            date: ticket.createdDate,
            isClosingNote: false
        }];
        return ticket.notes;
    }

    ticket.notes = [];
    return ticket.notes;
}

function addNotesSection(container, ticket) {
    const notes = getTechnicianNotes(ticket);
    if (notes.length === 0) return;

    const section = document.createElement("section");
    section.classList.add("ticket-notes");
    const heading = document.createElement("h4");
    heading.textContent = "Technician Updates";
    section.appendChild(heading);

    notes.forEach(note => {
        const noteItem = document.createElement("div");
        noteItem.classList.add("note-item");
        if (note.isClosingNote) noteItem.classList.add("closing-note");

        const noteTitle = document.createElement("strong");
        noteTitle.textContent = note.isClosingNote ? "Final closing note" : "Technician note";
        const noteText = document.createElement("p");
        noteText.textContent = note.text;
        const noteDate = document.createElement("time");
        noteDate.textContent = formatDate(note.date);
        noteItem.append(noteTitle, noteText, noteDate);
        section.appendChild(noteItem);
    });

    container.appendChild(section);
}

function createTicketListItem(ticket, selectedId, onSelect) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("ticket-list-item");
    if (ticket.id === selectedId) button.classList.add("selected");
    if (["Closed", "Canceled"].includes(ticket.status)) button.classList.add("list-item-inactive");

    const topLine = document.createElement("span");
    topLine.classList.add("ticket-list-topline");
    const number = document.createElement("strong");
    number.textContent = `#${ticket.id}`;
    const meta = document.createElement("span");
    meta.classList.add("ticket-list-meta");
    meta.textContent = `L${ticket.requiredLevel || getRequiredLevel(ticket)} • ${ticket.priority || "No priority"}`;
    const status = document.createElement("span");
    status.classList.add("status-pill");
    status.classList.add(`status-${ticket.status.toLowerCase()}`);
    status.textContent = ticket.status;
    topLine.append(number, meta, status);

    const title = document.createElement("span");
    title.classList.add("ticket-list-title");
    title.textContent = ticket.title;
    const date = document.createElement("time");
    date.textContent = formatDate(ticket.createdDate);
    button.append(topLine, title, date);
    button.addEventListener("click", onSelect);
    return button;
}

function createTicketDetail(ticket, isTechnician) {
    const detail = document.createElement("article");
    const priorityClass = ticket.priority ? `priority-${ticket.priority.toLowerCase()}` : "priority-unset";
    detail.classList.add("ticket-detail", priorityClass);
    if (["Closed", "Canceled"].includes(ticket.status)) detail.classList.add("ticket-inactive");
    detail.appendChild(createTicketHeading(ticket));
    addDetail(detail, "Requester", ticket.requesterName);
    addDetail(detail, "Email", ticket.requesterEmail);
    addDetail(detail, "Description", ticket.description);
    addDetail(detail, "Category", ticket.category);
    addDetail(detail, "Department", ticket.department);
    addDetail(detail, "Priority", ticket.priority);
    addDetail(detail, "Priority Score", ticket.priorityScore ? `P${ticket.priorityScore}` : "Not calculated");
    addDetail(detail, "Required Technician Level", ticket.requiredLevel ? `Level ${ticket.requiredLevel}` : "Not routed");
    addDetail(detail, "Status", ticket.status);
    addDetail(detail, "Assigned To", ticket.assignedTechnicianName || getTechnicianDisplayName(ticket.assignedTechnician));
    addDetail(detail, "Created", formatDate(ticket.createdDate));
    addDetail(detail, "Expected Resolution", formatDate(ticket.expectedDate));
    if (ticket.closedDate) addDetail(detail, "Closed", formatDate(ticket.closedDate));
    addNotesSection(detail, ticket);

    if (isTechnician) addTechnicianControls(detail, ticket);
    else addUserControls(detail, ticket);
    return detail;
}

function addUserControls(detail, ticket) {
    if (["Closed", "Canceled"].includes(ticket.status)) return;

    const controls = document.createElement("div");
    controls.classList.add("user-ticket-controls");
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("danger-button");
    cancelButton.textContent = "Cancel Ticket";
    cancelButton.addEventListener("click", () => cancelTicketAsUser(ticket.id));
    controls.appendChild(cancelButton);
    detail.appendChild(controls);
}

function addTechnicianControls(detail, ticket) {
    const controls = document.createElement("div");
    controls.classList.add("technician-controls");
    const assignmentLabel = document.createElement("label");
    assignmentLabel.textContent = "Assignment";
    const assignmentButton = document.createElement("button");
    assignmentButton.type = "button";
    assignmentButton.classList.add("secondary-button", "assignment-button");

    if (portalRole === "admin") {
        assignmentButton.textContent = ticket.assignedTechnician
            ? `Reassign ${ticket.assignedTechnicianName || getTechnicianDisplayName(ticket.assignedTechnician)}`
            : "Assign Technician";
        assignmentButton.addEventListener("click", () => assignTechnician(ticket.id, "assign"));
    } else {
        assignmentButton.textContent = "Escalate Ticket";
        assignmentButton.addEventListener("click", () => assignTechnician(ticket.id, "escalate"));
    }

    const statusLabel = document.createElement("label");
    statusLabel.textContent = "Status";
    const statusSelect = document.createElement("select");
    ["Open", "Hold", "Canceled", "Escalated", "Closed"].forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        option.selected = ticket.status === status;
        statusSelect.appendChild(option);
    });
    statusSelect.addEventListener("change", async () => {
        const updateSucceeded = await updateTicketStatus(ticket.id, statusSelect.value);
        if (!updateSucceeded) statusSelect.value = ticket.status;
    });

    const noteLabel = document.createElement("label");
    noteLabel.textContent = "Technician note";
    const noteInput = document.createElement("textarea");
    noteInput.placeholder = "Write an update for the user...";
    const saveNoteButton = document.createElement("button");
    saveNoteButton.type = "button";
    saveNoteButton.textContent = "Save Note";
    saveNoteButton.addEventListener("click", () => saveTechnicianNote(ticket.id, noteInput.value));
    controls.append(
        assignmentLabel,
        assignmentButton,
        statusLabel,
        statusSelect,
        noteLabel,
        noteInput,
        saveNoteButton
    );
    detail.appendChild(controls);
}

function renderTicketWorkspace(container, selectedId, isTechnician, ticketCollection = tickets, onTicketSelect) {
    container.replaceChildren();
    if (ticketCollection.length === 0) {
        const message = document.createElement("p");
        message.classList.add("empty-state");
        message.textContent = isTechnician ? "No tickets are waiting for review." : "No tickets created yet.";
        container.appendChild(message);
        return;
    }

    const selectedTicket = ticketCollection.find(ticket => ticket.id === selectedId) || ticketCollection[0];
    const workspace = document.createElement("div");
    workspace.classList.add("ticket-workspace");
    const list = document.createElement("nav");
    list.classList.add("ticket-list-panel");
    list.setAttribute("aria-label", "Tickets");

    ticketCollection.forEach(ticket => {
        list.appendChild(createTicketListItem(ticket, selectedTicket.id, () => {
            if (onTicketSelect) onTicketSelect(ticket.id);
            else if (isTechnician) selectedTechnicianTicketId = ticket.id;
            else selectedUserTicketId = ticket.id;
            renderTicketWorkspace(container, ticket.id, isTechnician, ticketCollection, onTicketSelect);
        }));
    });

    workspace.append(list, createTicketDetail(selectedTicket, isTechnician));
    container.appendChild(workspace);
}

function displayTickets() {
    if (!ticketList) return;
    renderTicketWorkspace(ticketList, selectedUserTicketId, false);
}

function createAdminTechnicianButton(technicianId) {
    const account = technicianAccounts[technicianId];
    const assignedTickets = tickets.filter(ticket => ticket.assignedTechnician === technicianId);
    const activeCount = assignedTickets.filter(isActiveTicket).length;
    const closedCount = assignedTickets.length - activeCount;
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("admin-technician-item");
    if (technicianId === selectedAdminTechnicianId) button.classList.add("selected");
    button.innerHTML = `
        <span>
            <strong>${account.label}</strong>
            <small>${technicianId}</small>
        </span>
        <span class="admin-tech-counts">
            <span>${activeCount} active</span>
            <span>${closedCount} closed</span>
        </span>
    `;
    button.addEventListener("click", () => {
        selectedAdminTechnicianId = technicianId;
        selectedAdminTicketId = tickets.find(ticket => ticket.assignedTechnician === technicianId)?.id ?? null;
        renderAdminTechnicianBoard();
    });
    return button;
}

function renderAdminTechnicianBoard() {
    if (!adminTechnicianBoard) return;

    adminTechnicianBoard.replaceChildren();

    const board = document.createElement("div");
    board.classList.add("admin-technician-board");

    const technicianPanel = document.createElement("nav");
    technicianPanel.classList.add("admin-technician-panel");
    technicianPanel.setAttribute("aria-label", "Technicians");
    Object.keys(technicianAccounts).forEach(technicianId => {
        technicianPanel.appendChild(createAdminTechnicianButton(technicianId));
    });

    const assignedTickets = tickets.filter(ticket => ticket.assignedTechnician === selectedAdminTechnicianId);
    const selectedTicket = assignedTickets.find(ticket => ticket.id === selectedAdminTicketId) || assignedTickets[0];
    selectedAdminTicketId = selectedTicket?.id ?? null;

    const ticketPanel = document.createElement("nav");
    ticketPanel.classList.add("ticket-list-panel", "admin-ticket-panel");
    ticketPanel.setAttribute("aria-label", "Assigned tickets");

    if (assignedTickets.length === 0) {
        const empty = document.createElement("p");
        empty.classList.add("empty-state");
        empty.textContent = "No tickets assigned to this technician.";
        ticketPanel.appendChild(empty);
    } else {
        assignedTickets.forEach(ticket => {
            ticketPanel.appendChild(createTicketListItem(ticket, selectedAdminTicketId, () => {
                selectedAdminTicketId = ticket.id;
                renderAdminTechnicianBoard();
            }));
        });
    }

    const detailPanel = selectedTicket
        ? createTicketDetail(selectedTicket, true)
        : document.createElement("article");

    if (!selectedTicket) {
        detailPanel.classList.add("ticket-detail");
        const title = document.createElement("h3");
        title.textContent = "No ticket selected";
        const copy = document.createElement("p");
        copy.textContent = "Choose a technician with assigned tickets to view details.";
        detailPanel.append(title, copy);
    }

    board.append(technicianPanel, ticketPanel, detailPanel);
    adminTechnicianBoard.appendChild(board);
}

function displayTechnicianTickets() {
    if (portalRole === "admin") {
        if (adminTechnicianBoard) {
            renderAdminTechnicianBoard();
            return;
        }

        if (adminOpenTicketList) {
            const openTickets = tickets.filter(isActiveTicket);
            renderTicketWorkspace(
                adminOpenTicketList,
                selectedAdminOpenTicketId,
                true,
                openTickets,
                ticketId => {
                    selectedAdminOpenTicketId = ticketId;
                }
            );
        }

        if (adminClosedTicketList) {
            const closedTickets = tickets.filter(ticket => !isActiveTicket(ticket));
            renderTicketWorkspace(
                adminClosedTicketList,
                selectedAdminClosedTicketId,
                true,
                closedTickets,
                ticketId => {
                    selectedAdminClosedTicketId = ticketId;
                }
            );
        }

        if (!adminOpenTicketList && !adminClosedTicketList && technicianTicketList) {
            renderTicketWorkspace(technicianTicketList, selectedTechnicianTicketId, true, tickets);
        }
        return;
    }

    const myTickets = tickets.filter(ticket => ticket.assignedTechnician === currentTechnician);

    if (myTechnicianTicketList) {
        renderTicketWorkspace(
            myTechnicianTicketList,
            selectedMyTechnicianTicketId,
            true,
            myTickets,
            ticketId => {
                selectedMyTechnicianTicketId = ticketId;
            }
        );
    }

    if (!myTechnicianTicketList && technicianTicketList) {
        renderTicketWorkspace(technicianTicketList, selectedTechnicianTicketId, true, myTickets);
    }
}

function requestClosingNote() {
    const dialog = document.getElementById("closingNoteDialog");
    const form = document.getElementById("closingNoteForm");
    const noteInput = document.getElementById("closingNoteInput");
    const errorMessage = document.getElementById("closingNoteError");
    const cancelButton = document.getElementById("cancelClosingNote");

    if (!dialog || !form || !noteInput || !errorMessage || !cancelButton) return Promise.resolve(null);

    noteInput.value = "";
    errorMessage.hidden = true;
    dialog.showModal();
    noteInput.focus();

    return new Promise(resolve => {
        function finish(value) {
            form.removeEventListener("submit", handleSubmit);
            cancelButton.removeEventListener("click", handleCancel);
            dialog.removeEventListener("cancel", handleDialogCancel);
            dialog.close();
            resolve(value);
        }

        function handleSubmit(event) {
            event.preventDefault();
            const note = noteInput.value.trim();
            if (!note) {
                errorMessage.hidden = false;
                noteInput.focus();
                return;
            }
            finish(note);
        }

        function handleCancel() {
            finish(null);
        }

        function handleDialogCancel(event) {
            event.preventDefault();
            finish(null);
        }

        form.addEventListener("submit", handleSubmit);
        cancelButton.addEventListener("click", handleCancel);
        dialog.addEventListener("cancel", handleDialogCancel);
    });
}

function requestTechnicianAssignment(currentAssignment, mode) {
    const dialog = document.getElementById("assignmentDialog");
    const form = document.getElementById("assignmentForm");
    const errorMessage = document.getElementById("assignmentError");
    const cancelButton = document.getElementById("cancelAssignment");
    const title = document.getElementById("assignmentDialogTitle");
    const description = document.getElementById("assignmentDialogDescription");
    const confirmButton = document.getElementById("confirmAssignment");

    if (!dialog || !form || !errorMessage || !cancelButton) return Promise.resolve(null);

    form.reset();
    errorMessage.hidden = true;
    const isEscalation = mode === "escalate";
    title.textContent = isEscalation ? "Escalate ticket" : "Assign a technician";
    description.textContent = isEscalation
        ? "Choose another technician to take over. You will no longer see this ticket in your queue."
        : "Choose who will be responsible for this ticket.";
    confirmButton.textContent = isEscalation ? "Escalate Ticket" : "Assign Technician";

    form.querySelectorAll('input[name="assignedTechnician"]').forEach(option => {
        const optionLevel = Number(option.dataset.level || 0);
        const unavailable = isEscalation && (option.value === currentTechnician || optionLevel <= currentTechnicianLevel);
        option.disabled = unavailable;
        option.closest("label").hidden = unavailable;
    });
    const currentOption = form.querySelector(
        `input[name="assignedTechnician"][value="${currentAssignment || ""}"]`
    );
    if (currentOption) currentOption.checked = true;
    dialog.showModal();

    return new Promise(resolve => {
        function finish(value) {
            form.removeEventListener("submit", handleSubmit);
            cancelButton.removeEventListener("click", handleCancel);
            dialog.removeEventListener("cancel", handleDialogCancel);
            dialog.close();
            resolve(value);
        }

        function handleSubmit(event) {
            event.preventDefault();
            const selected = form.querySelector('input[name="assignedTechnician"]:checked');
            if (!selected) {
                errorMessage.hidden = false;
                return;
            }
            finish(selected.value);
        }

        function handleCancel() {
            finish(null);
        }

        function handleDialogCancel(event) {
            event.preventDefault();
            finish(null);
        }

        form.addEventListener("submit", handleSubmit);
        cancelButton.addEventListener("click", handleCancel);
        dialog.addEventListener("cancel", handleDialogCancel);
    });
}

async function assignTechnician(ticketId, mode) {
    const ticket = tickets.find(item => item.id === ticketId);
    if (!ticket) return;

    const previousTechnician = ticket.assignedTechnician;
    const technician = await requestTechnicianAssignment(previousTechnician, mode);
    if (!technician) return;

    ticket.assignedTechnician = technician;
    ticket.assignedTechnicianName = technicianAccounts[technician]?.label || technician;
    ticket.requiredLevel = Math.max(ticket.requiredLevel || 1, technicianAccounts[technician]?.level || 1);
    ticket.activityLog = ticket.activityLog || [];
    ticket.activityLog.push({
        date: new Date().toISOString(),
        message: mode === "escalate"
            ? `Ticket escalated from ${getTechnicianDisplayName(previousTechnician)} to ${getTechnicianDisplayName(technician)}.`
            : `Ticket assigned to ${getTechnicianDisplayName(technician)}.`
    });
    saveTickets();
    displayTickets();
    displayTechnicianTickets();
}

async function updateTicketStatus(ticketId, status) {
    const ticket = tickets.find(item => item.id === ticketId);
    if (!ticket) return false;

    if (status === "Closed" && ticket.status !== "Closed") {
        const closingNote = await requestClosingNote();

        if (!closingNote) return false;

        getTechnicianNotes(ticket).push({
            text: closingNote,
            date: new Date().toISOString(),
            isClosingNote: true
        });
    }

    ticket.status = status;
    ticket.closedDate = status === "Closed" ? new Date().toISOString() : null;
    ticket.activityLog = ticket.activityLog || [];
    ticket.activityLog.push({ date: new Date().toISOString(), message: `Status changed to ${status}` });
    saveTickets();
    displayTickets();
    displayTechnicianTickets();
    return true;
}

function cancelTicketAsUser(ticketId) {
    const ticket = tickets.find(item => item.id === ticketId);
    if (!ticket || ["Closed", "Canceled"].includes(ticket.status)) return;

    if (!window.confirm("Are you sure you want to cancel this ticket?")) return;

    ticket.status = "Canceled";
    ticket.closedDate = null;
    ticket.activityLog = ticket.activityLog || [];
    ticket.activityLog.push({
        date: new Date().toISOString(),
        message: "Ticket canceled by user."
    });
    saveTickets();
    displayTickets();
    displayTechnicianTickets();
}

function saveTechnicianNote(ticketId, note) {
    const ticket = tickets.find(item => item.id === ticketId);
    if (!ticket) return;
    if (!note.trim()) {
        window.alert("Write a note before submitting it.");
        return;
    }

    getTechnicianNotes(ticket).push({
        text: note.trim(),
        date: new Date().toISOString(),
        isClosingNote: false
    });
    ticket.activityLog = ticket.activityLog || [];
    ticket.activityLog.push({ date: new Date().toISOString(), message: "Technician note updated." });
    saveTickets();
    displayTickets();
    displayTechnicianTickets();
}

if (ticketForm) {
    ticketForm.addEventListener("submit", event => {
        event.preventDefault();
        const ticket = new Ticket(
            generateTicketId(),
            document.getElementById("requesterName").value.trim(),
            document.getElementById("requesterEmail").value.trim(),
            document.getElementById("title").value.trim(),
            document.getElementById("description").value.trim(),
            document.getElementById("category").value,
            document.getElementById("department").value.trim(),
            document.getElementById("priority").value,
            document.getElementById("expectedDate").value
        );
        autoAssignTicket(ticket);
        ticket.activityLog = ticket.activityLog || [];
        ticket.activityLog.push({
            date: new Date().toISOString(),
            message: `Ticket automatically routed to ${ticket.assignedTechnicianName}.`
        });
        tickets.push(ticket);
        selectedUserTicketId = ticket.id;
        selectedTechnicianTicketId = ticket.id;
        saveTickets();
        displayTickets();
        ticketForm.reset();
        const redirectTarget = document.body.dataset.afterSubmit;
        if (redirectTarget) {
            const params = new URLSearchParams({
                name: ticket.requesterName,
                email: ticket.requesterEmail
            });
            window.location.href = `${redirectTarget}?${params.toString()}`;
        }
    });
}

displayTickets();
updateTechnicianPageCopy();
displayTechnicianTickets();
