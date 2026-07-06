const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const technicianTicketList = document.getElementById("technicianTicketList");

let tickets = loadTickets();
let selectedUserTicketId = tickets[0]?.id ?? null;
let selectedTechnicianTicketId = tickets[0]?.id ?? null;

function loadTickets() {
    try {
        const savedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
        return savedTickets.map(ticket => {
            if (ticket.status === "In Progress") ticket.status = "Open";
            if (ticket.status === "Resolved") ticket.status = "Closed";
            return ticket;
        });
    } catch (error) {
        console.error("Could not load saved tickets.", error);
        return [];
    }
}

function generateTicketId() {
    return tickets.length === 0 ? 1001 : Math.max(...tickets.map(ticket => ticket.id)) + 1;
}

function saveTickets() {
    localStorage.setItem("tickets", JSON.stringify(tickets));
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
    const status = document.createElement("span");
    status.classList.add("status-pill");
    status.classList.add(`status-${ticket.status.toLowerCase()}`);
    status.textContent = ticket.status;
    topLine.append(number, status);

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
    detail.classList.add("ticket-detail", `priority-${ticket.priority.toLowerCase()}`);
    if (["Closed", "Canceled"].includes(ticket.status)) detail.classList.add("ticket-inactive");
    detail.appendChild(createTicketHeading(ticket));
    addDetail(detail, "Description", ticket.description);
    addDetail(detail, "Category", ticket.category);
    addDetail(detail, "Department", ticket.department);
    addDetail(detail, "Priority", ticket.priority);
    addDetail(detail, "Status", ticket.status);
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
    statusSelect.addEventListener("change", () => {
        const updateSucceeded = updateTicketStatus(ticket.id, statusSelect.value);
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
    controls.append(statusLabel, statusSelect, noteLabel, noteInput, saveNoteButton);
    detail.appendChild(controls);
}

function renderTicketWorkspace(container, selectedId, isTechnician) {
    container.replaceChildren();
    if (tickets.length === 0) {
        const message = document.createElement("p");
        message.classList.add("empty-state");
        message.textContent = isTechnician ? "No tickets are waiting for review." : "No tickets created yet.";
        container.appendChild(message);
        return;
    }

    const selectedTicket = tickets.find(ticket => ticket.id === selectedId) || tickets[0];
    const workspace = document.createElement("div");
    workspace.classList.add("ticket-workspace");
    const list = document.createElement("nav");
    list.classList.add("ticket-list-panel");
    list.setAttribute("aria-label", "Tickets");

    tickets.forEach(ticket => {
        list.appendChild(createTicketListItem(ticket, selectedTicket.id, () => {
            if (isTechnician) selectedTechnicianTicketId = ticket.id;
            else selectedUserTicketId = ticket.id;
            renderTicketWorkspace(container, ticket.id, isTechnician);
        }));
    });

    workspace.append(list, createTicketDetail(selectedTicket, isTechnician));
    container.appendChild(workspace);
}

function displayTickets() {
    if (!ticketList) return;
    renderTicketWorkspace(ticketList, selectedUserTicketId, false);
}

function displayTechnicianTickets() {
    if (!technicianTicketList) return;
    renderTicketWorkspace(technicianTicketList, selectedTechnicianTicketId, true);
}

function updateTicketStatus(ticketId, status) {
    const ticket = tickets.find(item => item.id === ticketId);
    if (!ticket) return false;

    if (status === "Closed" && ticket.status !== "Closed") {
        const closingNote = window.prompt(
            "Before closing this ticket, explain how the issue was resolved and why it is being closed:"
        );

        if (!closingNote || !closingNote.trim()) {
            window.alert("A final note is required to close the ticket.");
            return false;
        }

        getTechnicianNotes(ticket).push({
            text: closingNote.trim(),
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
            document.getElementById("title").value.trim(),
            document.getElementById("description").value.trim(),
            document.getElementById("category").value,
            document.getElementById("department").value.trim(),
            document.getElementById("priority").value,
            document.getElementById("expectedDate").value
        );
        tickets.push(ticket);
        selectedUserTicketId = ticket.id;
        selectedTechnicianTicketId = ticket.id;
        saveTickets();
        displayTickets();
        ticketForm.reset();
    });
}

displayTickets();
displayTechnicianTickets();
