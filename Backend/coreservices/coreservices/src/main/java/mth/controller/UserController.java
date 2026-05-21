package mth.controller;

import mth.entity.User;
import mth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    // ── Auth ──────────────────────────────────────────────────────────────────

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");
            Map<String, Object> result = userService.login(username, password);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        try {
            User user = new User();
            user.setUsername((String) body.get("username"));
            user.setFirstName((String) body.getOrDefault("firstName", body.getOrDefault("fullname", "")));
            user.setLastName((String) body.getOrDefault("lastName", ""));
            user.setEmail((String) body.get("email"));
            user.setPhoneNumber((String) body.getOrDefault("phoneNumber", body.getOrDefault("phone", "")));
            user.setAddress((String) body.getOrDefault("address", ""));
            user.setRole((String) body.getOrDefault("role", "MEMBER"));
            user.setPassword((String) body.get("password"));
            Object limit = body.get("maxBorrowLimit");
            user.setMaxBorrowLimit(limit instanceof Number ? ((Number) limit).intValue() : 5);
            Map<String, Object> result = userService.register(user);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return userService.getById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.create(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.update(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Gateway alias routes ──────────────────────────────────────────────────

    @GetMapping("/uinfo")
    public ResponseEntity<?> uinfo(@RequestHeader(value = "Token", required = false) String token) {
        // Token format: "token-{id}-{role}"
        if (token == null || !token.startsWith("token-")) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
        try {
            String[] parts = token.split("-");
            Long userId = Long.parseLong(parts[1]);
            return userService.getById(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestHeader(value = "Token", required = false) String token) {
        return uinfo(token);
    }
}
