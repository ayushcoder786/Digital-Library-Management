package mth.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_records")
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "borrow_date", nullable = false)
    private LocalDate borrowDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(nullable = false, length = 20)
    private String status = "BORROWED";

    @Column(name = "fine_amount", precision = 10, scale = 2)
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(length = 500)
    private String notes;

    // ── Constructors ──────────────────────────────────────────────────────────
    public BorrowRecord() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public User getUser()                       { return user; }
    public void setUser(User user)              { this.user = user; }

    public Book getBook()                       { return book; }
    public void setBook(Book book)              { this.book = book; }

    public LocalDate getBorrowDate()            { return borrowDate; }
    public void setBorrowDate(LocalDate d)      { this.borrowDate = d; }

    public LocalDate getDueDate()               { return dueDate; }
    public void setDueDate(LocalDate d)         { this.dueDate = d; }

    public LocalDate getReturnDate()            { return returnDate; }
    public void setReturnDate(LocalDate d)      { this.returnDate = d; }

    public String getStatus()                   { return status; }
    public void setStatus(String status)        { this.status = status; }

    public BigDecimal getFineAmount()           { return fineAmount; }
    public void setFineAmount(BigDecimal fine)  { this.fineAmount = fine; }

    public LocalDateTime getCreatedAt()         { return createdAt; }
    public void setCreatedAt(LocalDateTime d)   { this.createdAt = d; }

    public String getNotes()                    { return notes; }
    public void setNotes(String notes)          { this.notes = notes; }
}
