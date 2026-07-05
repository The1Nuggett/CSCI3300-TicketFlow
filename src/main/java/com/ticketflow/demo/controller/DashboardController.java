package com.ticketflow.demo.controller;

import com.ticketflow.demo.Ticket;
import com.ticketflow.demo.repository.TicketRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

@Controller
public class DashboardController {

    private final TicketRepository ticketRepository;

    // Spring Automatically injects your new TicketRepository interface here
    public DashboardController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @GetMapping("/admin/dashboard")
    public String showDashboard(Model model) {
        // 1. Fetch ALL tickets dynamically from your database
        List<Ticket> liveTickets = ticketRepository.findAll();

        // 2. Count tickets automatically using your custom repository queries
        long openCount = ticketRepository.countByStatus("Open");
        long progressCount = ticketRepository.countByStatus("In Progress");
        long closedCount = ticketRepository.countByStatus("Closed");

        // 3. Send all live metrics and ticket rows over to your dashboard.html template
        model.addAttribute("tickets", liveTickets);
        model.addAttribute("totalOpen", openCount);
        model.addAttribute("totalInProgress", progressCount);
        model.addAttribute("totalClosed", closedCount);

        return "dashboard"; // This tells Spring Boot to render src/main/resources/templates/dashboard.html
    }

    @PostMapping("/admin/tickets/update")
    public String updateTicket(
            @RequestParam("ticketId") Long ticketId,
            @RequestParam("status") String newStatus,
            @RequestParam("agent") String newAgent) {
        
        // Find the specific ticket inside the database, make changes, and update it live
        ticketRepository.findById(ticketId).ifPresent(ticket -> {
            ticket.setStatus(newStatus);
            ticket.setAssignedTo(newAgent);
            ticketRepository.save(ticket); // Overwrites the record with updated fields
        });
        
        // This reloads the dashboard page instantly to show your updated status choices
        return "redirect:/admin/dashboard"; 
    }
}
