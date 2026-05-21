package mth.controller;

import mth.entity.BorrowRecord;
import mth.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(borrowService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return borrowService.getById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getByUser(userId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdue() {
        return ResponseEntity.ok(borrowService.getOverdue());
    }

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "14") int borrowDays) {
        try {
            BorrowRecord record = borrowService.borrowBook(userId, bookId, borrowDays);
            return ResponseEntity.ok(record);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            BorrowRecord record = borrowService.returnBook(id);
            return ResponseEntity.ok(record);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
