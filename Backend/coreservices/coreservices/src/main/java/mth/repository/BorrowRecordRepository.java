package mth.repository;

import mth.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserId(Long userId);

    List<BorrowRecord> findByBookId(Long bookId);

    List<BorrowRecord> findByStatus(String status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'OVERDUE' OR " +
           "(br.status = 'BORROWED' AND br.dueDate < CURRENT_DATE)")
    List<BorrowRecord> findOverdue();

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.user.id = :userId AND br.status = 'BORROWED'")
    long countActiveBorrowsByUser(@Param("userId") Long userId);
}
