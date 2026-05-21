package mth.service;

import mth.entity.User;
import mth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Login: match by username, return user data (no password hashing for demo).
     * Returns a simple token map: { token, user }.
     */
    public Map<String, Object> login(String username, String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Password check (plain-text for demo; replace with BCrypt in production)
        if (user.getPassword() == null || !user.getPassword().equals(password)) {
            // For seed users without passwords, allow any password (demo mode)
            if (user.getPassword() != null) {
                throw new RuntimeException("Invalid password.");
            }
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Account is deactivated.");
        }

        // Simple "token" = base64-like string (replace with JWT in production)
        String token = "token-" + user.getId() + "-" + user.getRole().toLowerCase();

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", userToMap(user));
        return result;
    }

    /**
     * Register a new user.
     */
    public Map<String, Object> register(User newUser) {
        if (userRepository.existsByUsername(newUser.getUsername())) {
            throw new RuntimeException("Username already taken: " + newUser.getUsername());
        }
        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new RuntimeException("Email already registered: " + newUser.getEmail());
        }
        newUser.setMembershipDate(LocalDateTime.now());
        newUser.setIsActive(true);
        if (newUser.getRole() == null || newUser.getRole().isBlank()) {
            newUser.setRole("MEMBER");
        }
        User saved = userRepository.save(newUser);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "User registered successfully.");
        result.put("user", userToMap(saved));
        return result;
    }

    public User create(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        user.setMembershipDate(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User update(Long id, User updated) {
        User existing = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setAddress(updated.getAddress());
        existing.setRole(updated.getRole());
        existing.setIsActive(updated.getIsActive());
        existing.setMaxBorrowLimit(updated.getMaxBorrowLimit());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(updated.getPassword());
        }
        return userRepository.save(existing);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private Map<String, Object> userToMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("firstName", u.getFirstName());
        m.put("lastName", u.getLastName());
        m.put("email", u.getEmail());
        m.put("phoneNumber", u.getPhoneNumber());
        m.put("role", u.getRole());
        m.put("isActive", u.getIsActive());
        m.put("maxBorrowLimit", u.getMaxBorrowLimit());
        m.put("membershipDate", u.getMembershipDate());
        return m;
    }
}
