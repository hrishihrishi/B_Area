package com.barea.modules.company.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barea.modules.company.domain.Store;
import com.barea.modules.company.repository.StoreRepository;

@Service
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreService(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    public List<Store> getStoresByCompany(UUID companyId) {
        System.out.println("[StoreService] getStoresByCompany() companyId: " + companyId);
        return storeRepository.findByCompanyId(companyId);
    }

    public Optional<Store> getStoreById(UUID storeId) {
        return storeRepository.findById(storeId);
    }

    @Transactional
    public Store createStore(Store store) {
        System.out.println("[StoreService] createStore() for companyId: " + store.getCompanyId() + ", storeName: " + store.getStoreName());
        return storeRepository.save(store);
    }

    @Transactional
    public void deleteStore(UUID storeId) {
        System.out.println("[StoreService] deleteStore() storeId: " + storeId);
        storeRepository.deleteById(storeId);
    }
}
