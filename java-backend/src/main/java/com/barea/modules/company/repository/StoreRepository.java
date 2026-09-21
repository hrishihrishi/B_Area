package com.barea.modules.company.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.barea.modules.company.domain.Store;

@Repository
public interface StoreRepository extends JpaRepository<Store, UUID> {
    List<Store> findByCompanyId(UUID companyId);
}
