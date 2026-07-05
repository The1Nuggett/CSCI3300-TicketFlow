package com.ticketflow.demo;

import com.ticketflow.demo.Ticket;
import com.ticketflow.demo.repository.TicketRepository;
import org.springframework.boot.CommandLineRunner; 
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner { 

    private final TicketRepository ticketRepository;

    // Spring boot injects working repository
    public DataInitializer(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed data if your in-memory database table is completely empty
        if (ticketRepository.count() == 0) {
            ticketRepository.save(new Ticket("Login loop on mobile app", "High", "Open", "Sarah Jenkins"));
            ticketRepository.save(new Ticket("Payment gateway timeout 504", "Urgent", "In Progress", "Alex Rivera"));
            ticketRepository.save(new Ticket("Typo in footer link privacy policy", "Low", "Closed", "Unassigned"));
            
            System.out.println("Ticketflow Database successfully seeded with demo admin tickets!");
        }
    }
}
