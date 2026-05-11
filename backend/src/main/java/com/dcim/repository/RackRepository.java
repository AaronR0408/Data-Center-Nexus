package com.dcim.repository;

import com.dcim.entity.Rack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RackRepository extends JpaRepository<Rack, Long> {
    List<Rack> findByRoomId(Long roomId);

    @Query("SELECT r FROM Rack r JOIN FETCH r.room rm JOIN FETCH rm.site")
    List<Rack> findAllWithRoomAndSite();
}
