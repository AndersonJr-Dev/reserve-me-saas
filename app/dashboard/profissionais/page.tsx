/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, User, Users, Calendar } from 'lucide-react';
import { supabase } from '../../../src/lib/supabase/client';

type ProfessionalType = {
  id: string;
  salon_id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  photo_url?: string;
};

type LocalUser = {
  id: string;
  name?: string;
  email?: string;
  salonId?: string;
};

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<ProfessionalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    photo_url: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await fetch('/api/auth/me');
        if (me.ok) {
          const body = await me.json();
          setUser(body.user || null);
        }
        const resp = await fetch('/api/dashboard/professionals');
        if (resp.ok) {
          const json = await resp.json();
          setProfessionals(json.professionals || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    const maxBytes = 3 * 1024 * 1024;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione uma imagem');
      return;
    }
    if (file.size > maxBytes) {
      alert('A imagem deve ter no máximo 3MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFormData({ ...formData, photo_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.salonId) return alert('Dados do usuário não encontrados');

    try {
      let photo_url = formData.photo_url || null;
      if (selectedFile) {
        if (!supabase) {
          alert('Supabase client não configurado');
          return;
        }
        setUploading(true);
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const ext = selectedFile.name.split('.').pop() || 'jpg';
        const fileName = `${user.salonId}/${id}.${ext}`;
        const { error } = await supabase.storage.from('avatars').upload(fileName, selectedFile);
        if (error) throw error;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        photo_url = data?.publicUrl || null;
        setUploading(false);
      }

      const payload = {
        name: formData.name,
        specialty: formData.specialty,
        phone: formData.phone,
        email: formData.email,
        photo_url
      };

      const method = editingProfessional ? 'PUT' : 'POST';
      const body = editingProfessional ? JSON.stringify({ id: editingProfessional.id, ...payload }) : JSON.stringify(payload);
      const res = await fetch('/api/dashboard/professionals', { method, headers: { 'Content-Type': 'application/json' }, body });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      if (editingProfessional) {
        setProfessionals((p) => p.map(i => i.id === json.professional.id ? json.professional : i));
      } else {
        setProfessionals((p) => [...p, json.professional]);
      }
      setFormData({ name: '', specialty: '', phone: '', email: '', photo_url: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowForm(false);
      setEditingProfessional(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar profissional');
      setUploading(false);
    }
  };

  const handleEdit = (p: ProfessionalType) => {
    setEditingProfessional(p);
    setFormData({ name: p.name, specialty: p.specialty || '', phone: p.phone || '', email: p.email || '', photo_url: p.photo_url || '' });
    setPreviewUrl(p.photo_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir profissional?')) return;
    await fetch(`/api/dashboard/professionals?id=${id}`, { method: 'DELETE' });
    setProfessionals((p) => p.filter(x => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div className="bg-linear-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Reserve.me</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Adicionar Profissional
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingProfessional ? 'Editar' : 'Novo'} Profissional</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input required placeholder="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="p-3 border rounded" />
                <input placeholder="Especialidade" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="p-3 border rounded" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="p-3 border rounded" />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="p-3 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Profissional</label>
                <div className="flex items-center space-x-4">
                  <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" /> : <User className="w-8 h-8 text-gray-400 m-3" />}
                  </div>
                </div>
                {uploading && <p className="text-sm text-blue-600 mt-1">Enviando imagem...</p>}
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Salvar</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingProfessional(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profissionais Cadastrados</h2>
            {loading ? <p>Carregando...</p> : professionals.length === 0 ? (
              <div className="text-center py-8"><Users className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p>Nenhum profissional cadastrado ainda.</p></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((p) => (
                  <div key={p.id} className="border p-4 rounded">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                        {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} /> : <User className="w-8 h-8 text-gray-400 m-3" />}
                      </div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-gray-600">{p.specialty}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button onClick={() => handleEdit(p)} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"><Edit className="w-4 h-4 mr-1"/> Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-3 py-1 rounded flex items-center"><Trash2 className="w-4 h-4 mr-1"/> Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

