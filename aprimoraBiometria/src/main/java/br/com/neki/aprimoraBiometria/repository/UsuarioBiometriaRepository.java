package br.com.neki.aprimoraBiometria.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.neki.aprimoraBiometria.entities.Usuario;
import br.com.neki.aprimoraBiometria.entities.UsuarioBiometria;

@Repository
public interface UsuarioBiometriaRepository extends JpaRepository<UsuarioBiometria, Integer>{

	Optional<UsuarioBiometria> findByUsuarioAndDeviceId(Usuario usu, String deviceId);
	
}
