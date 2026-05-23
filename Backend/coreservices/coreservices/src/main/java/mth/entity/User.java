package mth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 300)
    private String address;

    @Column(nullable = false, length = 20)
    private String role = "MEMBER";

    // Plain-text password field (not stored in DB schema but used for auth)
    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "membership_date")
    private LocalDateTime membershipDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "max_borrow_limit")
    private Integer maxBorrowLimit = 5;

    // ── Constructors ──────────────────────────────────────────────────────────
    public User() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public String getUsername()                 { return username; }
    public void setUsername(String username)    { this.username = username; }

    public String getFirstName()                { return firstName; }
    public void setFirstName(String firstName)  { this.firstName = firstName; }

    public String getLastName()                 { return lastName; }
    public void setLastName(String lastName)    { this.lastName = lastName; }

    public String getEmail()                    { return email; }
    public void setEmail(String email)          { this.email = email; }

    public String getPhoneNumber()              { return phoneNumber; }
    public void setPhoneNumber(String phone)    { this.phoneNumber = phone; }

    public String getAddress()                  { return address; }
    public void setAddress(String address)      { this.address = address; }

    public String getRole()                     { return role; }
    public void setRole(String role)            { this.role = role; }

    public String getPassword()                 { return password; }
    public void setPassword(String password)    { this.password = password; }

    public LocalDateTime getMembershipDate()            { return membershipDate; }
    public void setMembershipDate(LocalDateTime d)      { this.membershipDate = d; }

    public Boolean getIsActive()                { return isActive; }
    public void setIsActive(Boolean isActive)   { this.isActive = isActive; }

    public Integer getMaxBorrowLimit()                  { return maxBorrowLimit; }
    public void setMaxBorrowLimit(Integer maxBorrowLimit){ this.maxBorrowLimit = maxBorrowLimit; }
}
