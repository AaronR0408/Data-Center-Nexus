package com.dcim.repository;

import com.dcim.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByRackId(Long rackId);

    @Query("SELECT a FROM Asset a WHERE a.rack.id = :rackId ORDER BY a.uPosition")
    List<Asset> findByRackIdOrderByUPosition(@Param("rackId") Long rackId);

    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiration IS NOT NULL AND a.warrantyExpiration BETWEEN :now AND :cutoff ORDER BY a.warrantyExpiration")
    List<Asset> findExpiringWarranties(@Param("now") LocalDate now, @Param("cutoff") LocalDate cutoff);

    @Query("SELECT a FROM Asset a WHERE a.rack.id = :rackId AND a.id != :excludeId AND " +
           "((a.uPosition <= :uEnd AND (a.uPosition + a.uHeight - 1) >= :uStart))")
    List<Asset> findConflictingAssets(
        @Param("rackId") Long rackId,
        @Param("uStart") int uStart,
        @Param("uEnd") int uEnd,
        @Param("excludeId") Long excludeId
    );

    @Query("SELECT a.type, COUNT(a) FROM Asset a GROUP BY a.type")
    List<Object[]> countByType();

    long countByStatus(Asset.AssetStatus status);

    List<Asset> findByType(Asset.AssetType type);
}
