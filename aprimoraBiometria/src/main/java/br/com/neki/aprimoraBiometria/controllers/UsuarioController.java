package br.com.neki.aprimoraBiometria.controllers;


import java.io.UnsupportedEncodingException;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.neki.aprimoraBiometria.VO.BiometriaVO;
import br.com.neki.aprimoraBiometria.VO.LoginBiometriaVO;
import br.com.neki.aprimoraBiometria.VO.UsuarioVO;
import br.com.neki.aprimoraBiometria.entities.Usuario;
import br.com.neki.aprimoraBiometria.entities.UsuarioBiometria;
import br.com.neki.aprimoraBiometria.repository.UsuarioBiometriaRepository;
import br.com.neki.aprimoraBiometria.repository.UsuarioRepository;

@RestController
@RequestMapping("api")
public class UsuarioController {
	
	@Autowired
	private UsuarioRepository uRepository;
	@Autowired
	private UsuarioBiometriaRepository ubRepository;
	
	@PostMapping("login")
	public ResponseEntity<Usuario> login(@RequestBody UsuarioVO loginVO) {
		Optional<Usuario> u = uRepository.findByEmailAndSenha(loginVO.getEmail(), loginVO.getSenha());
		if(u.isPresent()) {
			return ResponseEntity.ok(u.get());
		}else {
			return ResponseEntity.notFound().build();
		}
	}
	@SuppressWarnings("rawtypes")
	@PutMapping("/cadastro/biometria")
	public ResponseEntity login(@RequestBody BiometriaVO biometriaVO) {
		Optional<Usuario> usu = uRepository.findById(biometriaVO.getIdUsuario());
		if(usu.isEmpty()) {
			return ResponseEntity.badRequest().build();
		}
		Optional<UsuarioBiometria> optUB = ubRepository.findByUsuarioAndDeviceId(usu.get(), biometriaVO.getDeviceId());
		
		UsuarioBiometria usuarioB;
		if(optUB.isEmpty()) {
			usuarioB= new UsuarioBiometria(usu.get(), biometriaVO.getPublicKey(), biometriaVO.getDeviceId());
		} else {
			usuarioB = optUB.get();
			usuarioB.setPublicKey(biometriaVO.getPublicKey());
		}
		ubRepository.save(usuarioB);
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/cadastro/biometria")
	public ResponseEntity removeBiometria(@RequestParam Integer idUsuario, String publicKey, String deviceId) {
		Optional<Usuario> usu = uRepository.findById(idUsuario);
		if(usu.isEmpty()) {
			return ResponseEntity.badRequest().build();
		}
		Optional<UsuarioBiometria> optUB = ubRepository.findByUsuarioAndDeviceId(usu.get(), deviceId);
		if(optUB.isEmpty()) {
			return ResponseEntity.notFound().build();
		} else {
			ubRepository.deleteById(optUB.get().getId());
		}
		return ResponseEntity.ok().build();
	}
	
	
	@PostMapping("loginBiometria")
	public ResponseEntity<Usuario> validarBiometria(@RequestBody LoginBiometriaVO lbVO){
		Optional<Usuario> u = uRepository.findById(lbVO.getIdUsuario());
		String payload = lbVO.getPayload();
		String deviceId = lbVO.getDeviceId();
		String signature = lbVO.getSignature();
		if(u.isEmpty() || payload == null || deviceId == null) {
			return ResponseEntity.badRequest().build();
		}
		Optional<UsuarioBiometria> ub = ubRepository.findByUsuarioAndDeviceId(u.get(), deviceId);
		if(ub.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		String publicKeyBanco = ub.get().getPublicKey();
		boolean login = false;
		
		try {
			byte[] messageBytes = payload.getBytes("UTF8");

			Signature sig = Signature.getInstance("SHA256WithRSA");

			// verification			
			
			PublicKey publicKey = getKey(publicKeyBanco);
			sig.initVerify(publicKey);
			sig.update(messageBytes);

			login = sig.verify(Base64.getDecoder().decode(signature.getBytes()));
		}catch(Exception e) {
			return ResponseEntity.notFound().build();
		}
		
		
		if(login == true) {
			return ResponseEntity.ok(u.get());
		}
		return ResponseEntity.notFound().build();

	}
	public static PublicKey getKey(String key) throws Exception {
		byte[] byteKey = Base64.getDecoder().decode(key.getBytes());
		X509EncodedKeySpec X509publicKey = new X509EncodedKeySpec(byteKey);
		KeyFactory kf = KeyFactory.getInstance("RSA");

		return kf.generatePublic(X509publicKey);
	}

}
