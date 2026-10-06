import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [etapa, setEtapa] = useState<'INICIO' | 'EN_CURSO'>('EN_CURSO');

  const servicio = {
    acompanianteNombre: 'Licda. Rosa Morales',
    telefono: '8095412000',
    destino: 'Clínica Abreu, Santo Domingo',
    pinLlegada: '4821',
  };

  const llamarAcompaniante = () => {
    Linking.openURL(`tel:${servicio.telefono}`);
  };

  const alertaEmergencia = () => {
    Alert.alert(
      '🚨 PEDIR AYUDA URGENTE',
      '¿Deseas conectar inmediatamente con la Central de Asistencia o Emergencias 911?',
      [
        { text: 'No, cancelar', style: 'cancel' },
        {
          text: 'SÍ, LLAMAR AL 911',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:911')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.contenedorSeguro}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* BARRA SUPERIOR ACCESIBLE */}
      <View style={styles.encabezado}>
        <View style={styles.logoContenedor}>
          <Text style={styles.logoTexto}>J</Text>
        </View>
        <View>
          <Text style={styles.tituloApp}>JUNTOS</Text>
          <Text style={styles.subtituloApp}>Asistencia y Acompañamiento</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cuerpoScroll}>
        {etapa === 'INICIO' ? (
          /* MODO INICIO: SOLICITUD SENCILLA */
          <View style={styles.seccionCentro}>
            <Ionicons name="heart-circle" size={100} color="#10b981" />
            <Text style={styles.tituloGrande}>¿Necesitas un acompañante hoy?</Text>
            <Text style={styles.textoExplicativo}>
              Te acompañamos a tus citas médicas, diligencias bancarias y compras cotidianas con total seguridad.
            </Text>

            <TouchableOpacity
              style={styles.botonPrincipal}
              onPress={() => setEtapa('EN_CURSO')}
              accessibilityLabel="Pedir un acompañante ahora"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={32} color="#020617" />
              <Text style={styles.botonPrincipalTexto}>PEDIR ACOMPAÑANTE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* MODO EN SERVICIO: PANTALLA CLARA CON CONTRASTE ALTO */
          <View style={styles.tarjetaServicio}>
            
            <View style={styles.etiquetaEstado}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.etiquetaTexto}>ACOMPAÑANTE EN CAMINO</Text>
            </View>

            <Text style={styles.etiquetaSeccion}>Tu Acompañante Asignada:</Text>
            <Text style={styles.nombreAcompaniante}>{servicio.acompanianteNombre}</Text>

            <View style={styles.filaDato}>
              <Ionicons name="location-sharp" size={26} color="#10b981" />
              <Text style={styles.textoDato}>{servicio.destino}</Text>
            </View>

            {/* BOTÓN LLAMADA DIRECTA (TAMAÑO EXTRA GRANDE) */}
            <TouchableOpacity
              style={styles.botonLlamar}
              onPress={llamarAcompaniante}
              accessibilityLabel="Llamar a mi acompañante por teléfono"
              accessibilityRole="button"
            >
              <Ionicons name="call" size={28} color="#020617" />
              <Text style={styles.botonLlamarTexto}>Llamar por Teléfono</Text>
            </TouchableOpacity>

            {/* PIN GIGANTE PARA DICTAR FACILMENTE */}
            <View style={styles.cajaClave}>
              <Text style={styles.claveTitulo}>Dile este número cuando llegue:</Text>
              <Text style={styles.numeroPin}>{servicio.pinLlegada}</Text>
              <Text style={styles.claveSubtitulo}>Código seguro de verificación</Text>
            </View>

            {/* BOTÓN DE EMERGENCIA */}
            <TouchableOpacity
              style={styles.botonEmergencia}
              onPress={alertaEmergencia}
              accessibilityLabel="Botón de emergencia SOS"
              accessibilityRole="button"
            >
              <Ionicons name="warning" size={26} color="#ffffff" />
              <Text style={styles.botonEmergenciaTexto}>BOTÓN DE EMERGENCIA</Text>
            </TouchableOpacity>

            {/* CAMBIO DE VISTA PARA PRUEBAS */}
            <TouchableOpacity
              style={styles.botonVolver}
              onPress={() => setEtapa('INICIO')}
            >
              <Text style={styles.botonVolverTexto}>Ver Pantalla de Solicitud</Text>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorSeguro: {
    flex: 1,
    backgroundColor: '#020617',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
    gap: 14,
  },
  logoContenedor: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    fontSize: 26,
    fontWeight: '900',
    color: '#020617',
  },
  tituloApp: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtituloApp: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  cuerpoScroll: {
    padding: 20,
  },
  seccionCentro: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  tituloGrande: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 34,
  },
  textoExplicativo: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginVertical: 18,
    lineHeight: 26,
  },
  botonPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 22,
    marginTop: 15,
    gap: 12,
  },
  botonPrincipalTexto: {
    fontSize: 20,
    fontWeight: '900',
    color: '#020617',
  },
  tarjetaServicio: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    padding: 22,
    gap: 16,
  },
  etiquetaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
    alignSelf: 'flex-start',
  },
  etiquetaTexto: {
    color: '#34d399',
    fontWeight: '800',
    fontSize: 15,
  },
  etiquetaSeccion: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  nombreAcompaniante: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  filaDato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textoDato: {
    fontSize: 17,
    color: '#e2e8f0',
    fontWeight: '600',
    flexShrink: 1,
  },
  botonLlamar: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  botonLlamarTexto: {
    fontSize: 20,
    fontWeight: '900',
    color: '#020617',
  },
  cajaClave: {
    backgroundColor: '#020617',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginVertical: 6,
  },
  claveTitulo: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  numeroPin: {
    fontSize: 48,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 10,
  },
  claveSubtitulo: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  botonEmergencia: {
    flexDirection: 'row',
    backgroundColor: '#e11d48',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  botonEmergenciaTexto: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  botonVolver: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonVolverTexto: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});