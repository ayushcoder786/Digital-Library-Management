package mth.controller;

import mth.entity.Book;
import mth.entity.Category;
import mth.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/book")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(bookService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return bookService.getById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailable() {
        return ResponseEntity.ok(bookService.getAvailable());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(bookService.getByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String keyword) {
        return ResponseEntity.ok(bookService.search(keyword));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Book book = mapToBook(body);
            return ResponseEntity.ok(bookService.create(book));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Book book = mapToBook(body);
            return ResponseEntity.ok(bookService.update(id, book));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            bookService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Helper: map raw JSON body → Book entity ───────────────────────────────
    private Book mapToBook(Map<String, Object> body) {
        Book book = new Book();
        book.setTitle((String) body.get("title"));
        book.setAuthor((String) body.get("author"));
        book.setIsbn((String) body.get("isbn"));
        book.setDescription((String) body.get("description"));
        book.setPublisher((String) body.get("publisher"));
        book.setLanguage((String) body.getOrDefault("language", "English"));
        book.setCoverImageUrl((String) body.get("coverImageUrl"));

        if (body.get("totalCopies") instanceof Number n)
            book.setTotalCopies(n.intValue());
        if (body.get("availableCopies") instanceof Number n)
            book.setAvailableCopies(n.intValue());
        if (body.get("pageCount") instanceof Number n)
            book.setPageCount(n.intValue());
        if (body.get("isActive") instanceof Boolean b)
            book.setIsActive(b);

        // Category by id
        if (body.get("categoryId") instanceof Number n) {
            Category cat = new Category();
            cat.setId(n.longValue());
            book.setCategory(cat);
        } else if (body.get("category") instanceof Map<?, ?> catMap) {
            Object catId = catMap.get("id");
            if (catId instanceof Number n) {
                Category cat = new Category();
                cat.setId(n.longValue());
                book.setCategory(cat);
            }
        }

        return book;
    }
}
