package br.com.neki.aprimoraBiometria.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.neki.aprimoraBiometria.entities.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
	public Optional<Usuario> findByEmailAndSenha(String email, String senha);
}
