package mth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    // ── Constructors ──────────────────────────────────────────────────────────
    public Category() {}

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId()                     { return id; }
    public void setId(Long id)              { this.id = id; }

    public String getName()                 { return name; }
    public void setName(String name)        { this.name = name; }

    public String getDescription()          { return description; }
    public void setDescription(String d)    { this.description = d; }
}
