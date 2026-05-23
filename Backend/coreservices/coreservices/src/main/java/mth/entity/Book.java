package mth.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String author;

    @Column(nullable = false, unique = true, length = 20)
    private String isbn;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 2000)
    private String description;

    @Column(name = "published_date")
    private LocalDate publishedDate;

    @Column(length = 100)
    private String publisher;

    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies = 1;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies = 1;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(length = 50)
    private String language = "English";

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // ── Constructors ──────────────────────────────────────────────────────────
    public Book() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId()                             { return id; }
    public void setId(Long id)                      { this.id = id; }

    public String getTitle()                        { return title; }
    public void setTitle(String title)              { this.title = title; }

    public String getAuthor()                       { return author; }
    public void setAuthor(String author)            { this.author = author; }

    public String getIsbn()                         { return isbn; }
    public void setIsbn(String isbn)                { this.isbn = isbn; }

    public Category getCategory()                   { return category; }
    public void setCategory(Category category)      { this.category = category; }

    public String getDescription()                  { return description; }
    public void setDescription(String description)  { this.description = description; }

    public LocalDate getPublishedDate()             { return publishedDate; }
    public void setPublishedDate(LocalDate d)       { this.publishedDate = d; }

    public String getPublisher()                    { return publisher; }
    public void setPublisher(String publisher)      { this.publisher = publisher; }

    public Integer getTotalCopies()                 { return totalCopies; }
    public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

    public Integer getAvailableCopies()                     { return availableCopies; }
    public void setAvailableCopies(Integer availableCopies) { this.availableCopies = availableCopies; }

    public String getCoverImageUrl()                { return coverImageUrl; }
    public void setCoverImageUrl(String url)        { this.coverImageUrl = url; }

    public String getLanguage()                     { return language; }
    public void setLanguage(String language)        { this.language = language; }

    public Integer getPageCount()                   { return pageCount; }
    public void setPageCount(Integer pageCount)     { this.pageCount = pageCount; }

    public Boolean getIsActive()                    { return isActive; }
    public void setIsActive(Boolean isActive)       { this.isActive = isActive; }
}
